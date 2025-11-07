// API Mindmap - Advanced Visualization Dashboard
// Global state
let mindmapData = null;
let currentView = 'mindmap';
let currentTheme = 'light';
let svg, width, height;
let simulation = null;
let nodes = [];
let links = [];
let scale = 1;
let currentTransform = { x: 0, y: 0, k: 1 };

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons first
    lucide.createIcons();
    
    initializeTheme();
    initializeVisualization();
    loadMindmapData();
    setupEventListeners();
    setupKeyboardShortcuts();
    
    // Set initial toolbar state
    updateToolbarForView(currentView);
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('apiMindmapTheme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    localStorage.setItem('apiMindmapTheme', currentTheme);
    updateThemeIcon();
    lucide.createIcons();
}

function updateThemeIcon() {
    const themeToggle = document.querySelector('#themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    
    icon.setAttribute('data-lucide', currentTheme === 'light' ? 'sun' : 'moon');
    lucide.createIcons();
}

// Visualization Initialization
function initializeVisualization() {
    svg = d3.select('#mindmap');
    const container = document.querySelector('#mindmapView');
    
    if (!container) {
        console.error('Mindmap view container not found');
        return;
    }
    
    width = container.clientWidth;
    height = container.clientHeight;
    
    svg.attr('width', width).attr('height', height);
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            currentTransform = event.transform;
            const g = svg.select('g');
            if (g.node()) {
                g.attr('transform', event.transform);
            }
        });
    
    svg.call(zoom);
    svg.append('g');
}

// Load API data
async function loadMindmapData() {
    try {
        const response = await fetch('/api/mindmap');
        mindmapData = await response.json();
        
        // Cache data with size limit (5MB max)
        try {
            const dataStr = JSON.stringify(mindmapData);
            const sizeInBytes = new Blob([dataStr]).size;
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            
            if (sizeInBytes < maxSizeInBytes) {
                localStorage.setItem('apiMindmapCache', dataStr);
                localStorage.setItem('apiMindmapCacheTime', Date.now().toString());
                
                // Clean old cache entries (older than 24 hours)
                const cacheTime = parseInt(localStorage.getItem('apiMindmapCacheTime') || '0');
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                if (Date.now() - cacheTime > maxAge) {
                    localStorage.removeItem('apiMindmapCache');
                    localStorage.removeItem('apiMindmapCacheTime');
                }
            }
        } catch (cacheError) {
            console.warn('Failed to cache API data:', cacheError);
            // Continue without caching
        }
        
        updateStats(mindmapData);
        updateInsights(mindmapData);
        updateLegend();
        renderCurrentView();
    } catch (error) {
        console.error('Error loading mindmap data:', error);
        showError('Failed to load API structure. Please refresh the page.');
    }
}

// Statistics
function updateStats(data) {
    const statsElement = document.getElementById('stats');
    if (!statsElement) return;
    
    const controllers = data.nodes.filter(n => n.type === 'controller').length;
    const methods = data.nodes.filter(n => n.type === 'method').length;
    const dtos = data.nodes.filter(n => n.type === 'dto').length;
    
    const statsHtml = `
        <div class="stat-card">
            <div class="stat-label">Controllers</div>
            <div class="stat-value">${controllers}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Methods</div>
            <div class="stat-value">${methods}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">DTOs</div>
            <div class="stat-value">${dtos}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Links</div>
            <div class="stat-value">${data.links.length}</div>
        </div>
    `;
    
    statsElement.innerHTML = statsHtml;
}

function updateLegend() {
    const legendElement = document.getElementById('legend');
    if (!legendElement) return;
    
    const legendHtml = `
        <div class="legend-item">
            <span class="legend-color controller"></span>
            <span>Controller</span>
        </div>
        <div class="legend-item">
            <span class="legend-color method"></span>
            <span>Method</span>
        </div>
        <div class="legend-item">
            <span class="legend-color dto"></span>
            <span>DTO</span>
        </div>
    `;
    legendElement.innerHTML = legendHtml;
}

function updateInsights(data) {
    // Calculate most used DTOs
    const dtoUsage = {};
    data.links.forEach(link => {
        const target = data.nodes.find(n => n.id === link.target);
        if (target && target.type === 'dto') {
            dtoUsage[target.id] = (dtoUsage[target.id] || 0) + 1;
        }
    });
    
    const topDTOs = Object.entries(dtoUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const dto = data.nodes.find(n => n.id === id);
            return `<div class="text-gray-700 dark:text-gray-300">${dto.description || id}: ${count} uses</div>`;
        })
        .join('');
    
    const topDTOsElement = document.getElementById('topDTOs');
    if (topDTOsElement) {
        topDTOsElement.innerHTML = `
            <div class="font-semibold text-gray-900 dark:text-white mb-2">Most Used DTOs</div>
            ${topDTOs || '<div class="text-gray-500">No data</div>'}
        `;
    }
    
    // Calculate top controllers by method count
    const controllerMethods = {};
    data.links.forEach(link => {
        if (link.type === 'contains') {
            const source = link.source;
            controllerMethods[source] = (controllerMethods[source] || 0) + 1;
        }
    });
    
    const topControllers = Object.entries(controllerMethods)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const controller = data.nodes.find(n => n.id === id);
            return `<div class="text-gray-700 dark:text-gray-300">${controller.description || id}: ${count} methods</div>`;
        })
        .join('');
    
    const topControllersElement = document.getElementById('topControllers');
    if (topControllersElement) {
        topControllersElement.innerHTML = `
            <div class="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Top Controllers</div>
            ${topControllers || '<div class="text-gray-500">No data</div>'}
        `;
    }
}

// View Management
function switchView(viewName) {
    currentView = viewName;
    
    // Update tab active state
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewName);
    });
    
    // Update view content
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');
    
    // Update toolbar visibility based on view
    updateToolbarForView(viewName);
    
    renderCurrentView();
}

// Update toolbar buttons based on current view
function updateToolbarForView(viewName) {
    const graphControls = document.getElementById('graphControls');
    const tableControls = document.getElementById('tableControls');
    const svgExportItems = document.querySelectorAll('.export-svg-only');
    
    // Graph views (mindmap, tree, dependency) show zoom controls
    const isGraphView = ['mindmap', 'tree', 'dependency'].includes(viewName);
    const isTableView = viewName === 'table';
    
    if (graphControls) {
        graphControls.style.display = isGraphView ? 'flex' : 'none';
    }
    
    if (tableControls) {
        tableControls.style.display = isTableView ? 'flex' : 'none';
    }
    
    // SVG export only available for graph views
    svgExportItems.forEach(item => {
        item.style.display = isGraphView ? 'flex' : 'none';
    });
    
    // Reinitialize Lucide icons after DOM changes
    lucide.createIcons();
}

function renderCurrentView() {
    if (!mindmapData) return;
    
    switch (currentView) {
        case 'mindmap':
            renderMindmapView();
            break;
        case 'tree':
            renderTreeView();
            break;
        case 'dependency':
            renderDependencyView();
            break;
        case 'table':
            renderTableView();
            break;
        case 'matrix':
            renderMatrixView();
            break;
        case 'dashboard':
            renderDashboardView();
            break;
    }
}

// Mindmap View (Force-Directed Graph)
function renderMindmapView() {
    const svg = d3.select('#mindmap');
    svg.select('g').selectAll('*').remove();
    
    const g = svg.select('g');
    
    // Prepare nodes and links
    nodes = mindmapData.nodes.map(n => ({
        ...n,
        radius: n.type === 'controller' ? 20 : n.type === 'method' ? 15 : 12,
        color: n.type === 'controller' ? '#4f46e5' : n.type === 'method' ? '#ec4899' : '#06b6d4'
    }));
    
    links = mindmapData.links.map(l => ({ ...l }));
    
    // Create force simulation
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => d.radius + 10));
    
    // Draw links
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', d => `link ${d.type || ''}`)
        .attr('stroke-width', 2);
    
    // Draw nodes
    const node = g.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', d => `node ${d.type}`)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    node.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .on('mouseover', showNodeTooltip)
        .on('mouseout', hideTooltip)
        .on('click', highlightNode);
    
    node.append('text')
        .attr('dy', d => d.radius + 15)
        .attr('text-anchor', 'middle')
        .text(d => {
            if (d.type === 'controller') return d.id.replace('Controller', '');
            if (d.type === 'method') {
                const method = d.metadata?.httpMethod || '';
                const name = d.metadata?.actionName || d.id.split('.').pop();
                return `${method} ${name}`;
            }
            return d.description || d.id;
        })
        .style('font-size', '11px');
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

// Tree View
function renderTreeView() {
    const svg = d3.select('#treeCanvas');
    svg.selectAll('*').remove();
    
    const container = document.querySelector('#treeView');
    const w = container.clientWidth;
    const h = container.clientHeight;
    
    svg.attr('width', w).attr('height', h);
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Build hierarchy
    const root = { name: 'API', children: [] };
    
    const controllers = mindmapData.nodes.filter(n => n.type === 'controller');
    
    controllers.forEach(controller => {
        const controllerNode = { name: controller.description || controller.id, children: [] };
        
        const methodLinks = mindmapData.links.filter(l => l.source === controller.id && l.type === 'contains');
        methodLinks.forEach(link => {
            const method = mindmapData.nodes.find(n => n.id === link.target);
            if (method) {
                const methodNode = { name: method.description || method.id, children: [] };
                
                const dtoLinks = mindmapData.links.filter(l => l.source === method.id && (l.type === 'returns' || l.type === 'accepts'));
                dtoLinks.forEach(dtoLink => {
                    const dto = mindmapData.nodes.find(n => n.id === dtoLink.target);
                    if (dto) {
                        methodNode.children.push({ name: dto.description || dto.id });
                    }
                });
                
                controllerNode.children.push(methodNode);
            }
        });
        
        root.children.push(controllerNode);
    });
    
    const treeLayout = d3.tree().size([h - 100, w - 200]);
    const hierarchy = d3.hierarchy(root);
    const treeData = treeLayout(hierarchy);
    
    const g = svg.append('g')
        .attr('transform', 'translate(100, 50)');
    
    // Links
    g.selectAll('.tree-link')
        .data(treeData.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
    
    // Nodes
    const treeNodes = g.selectAll('.tree-node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);
    
    treeNodes.append('circle')
        .attr('r', 6)
        .attr('fill', d => d.depth === 0 ? '#4f46e5' : d.depth === 1 ? '#4f46e5' : d.depth === 2 ? '#ec4899' : '#06b6d4');
    
    treeNodes.append('text')
        .attr('dx', 10)
        .attr('dy', 5)
        .text(d => d.data.name)
        .style('font-size', '12px');
}

// Dependency View
function renderDependencyView() {
    const svg = d3.select('#dependencyCanvas');
    svg.selectAll('*').remove();
    
    const container = document.querySelector('#dependencyView');
    const w = container.clientWidth;
    const h = container.clientHeight;
    
    svg.attr('width', w).attr('height', h);
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Find DTOs used by multiple methods
    const dtoUsage = {};
    mindmapData.links.forEach(link => {
        if (link.type === 'returns' || link.type === 'accepts') {
            const dto = mindmapData.nodes.find(n => n.id === link.target && n.type === 'dto');
            if (dto) {
                if (!dtoUsage[dto.id]) dtoUsage[dto.id] = [];
                dtoUsage[dto.id].push(link.source);
            }
        }
    });
    
    const sharedDTOs = Object.entries(dtoUsage)
        .filter(([_, methods]) => methods.length > 1)
        .map(([dtoId, methods]) => ({
            dto: mindmapData.nodes.find(n => n.id === dtoId),
            methods: methods.map(mid => mindmapData.nodes.find(n => n.id === mid))
        }));
    
    const g = svg.append('g').attr('transform', 'translate(50, 50)');
    
    if (sharedDTOs.length === 0) {
        g.append('text')
            .attr('x', w / 2 - 50)
            .attr('y', h / 2)
            .attr('text-anchor', 'middle')
            .text('No shared dependencies found')
            .style('font-size', '16px')
            .attr('class', 'text-gray-500');
        return;
    }
    
    // Render as a simple network
    sharedDTOs.forEach((item, i) => {
        const y = i * 100 + 50;
        
        // DTO node
        g.append('circle')
            .attr('cx', w / 2)
            .attr('cy', y)
            .attr('r', 15)
            .attr('fill', '#06b6d4');
        
        g.append('text')
            .attr('x', w / 2)
            .attr('y', y - 25)
            .attr('text-anchor', 'middle')
            .text(item.dto.description || item.dto.id)
            .style('font-size', '12px')
            .attr('class', 'font-semibold');
        
        // Connected methods
        item.methods.forEach((method, j) => {
            const angle = (j / item.methods.length) * Math.PI * 2;
            const mx = w / 2 + Math.cos(angle) * 150;
            const my = y + Math.sin(angle) * 150;
            
            g.append('line')
                .attr('x1', w / 2)
                .attr('y1', y)
                .attr('x2', mx)
                .attr('y2', my)
                .attr('class', 'link');
            
            g.append('circle')
                .attr('cx', mx)
                .attr('cy', my)
                .attr('r', 10)
                .attr('fill', '#ec4899');
            
            g.append('text')
                .attr('x', mx)
                .attr('y', my + 20)
                .attr('text-anchor', 'middle')
                .text(method.description || method.id)
                .style('font-size', '10px');
        });
    });
}

// Table View
function renderTableView() {
    const tbody = document.getElementById('endpointsTableBody');
    tbody.innerHTML = '';
    
    const methods = mindmapData.nodes.filter(n => n.type === 'method');
    
    methods.forEach(method => {
        const controllerLink = mindmapData.links.find(l => l.target === method.id && l.type === 'contains');
        const controller = controllerLink ? mindmapData.nodes.find(n => n.id === controllerLink.source) : null;
        
        const dtoLinks = mindmapData.links.filter(l => l.source === method.id && (l.type === 'returns' || l.type === 'accepts'));
        const dtos = dtoLinks.map(l => {
            const dto = mindmapData.nodes.find(n => n.id === l.target);
            return dto ? dto.description || dto.id : '';
        }).filter(d => d).join(', ');
        
        const row = tbody.insertRow();
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${controller ? controller.description : ''}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${method.metadata?.actionName || ''}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getHttpMethodClass(method.metadata?.httpMethod)}">
                    ${method.metadata?.httpMethod || 'N/A'}
                </span>
            </td>
            <td class="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">${method.metadata?.route || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${dtos}</td>
        `;
    });
}

function getHttpMethodClass(method) {
    const classes = {
        'GET': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'POST': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'PUT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'DELETE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'PATCH': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return classes[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

// Matrix View
function renderMatrixView() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    
    const container = document.querySelector('#matrixView');
    canvas.width = container.clientWidth - 100;
    canvas.height = container.clientHeight - 100;
    
    const controllers = mindmapData.nodes.filter(n => n.type === 'controller');
    const dtos = mindmapData.nodes.filter(n => n.type === 'dto');
    
    const cellWidth = Math.min(canvas.width / (dtos.length + 1), 60);
    const cellHeight = Math.min(canvas.height / (controllers.length + 1), 40);
    
    // Calculate matrix data
    const matrix = [];
    controllers.forEach(controller => {
        const row = [];
        dtos.forEach(dto => {
            // Check if controller uses this DTO
            const controllerMethods = mindmapData.links
                .filter(l => l.source === controller.id && l.type === 'contains')
                .map(l => l.target);
            
            const usesDTO = mindmapData.links.some(l => 
                controllerMethods.includes(l.source) && 
                l.target === dto.id &&
                (l.type === 'returns' || l.type === 'accepts')
            );
            
            row.push(usesDTO ? 1 : 0);
        });
        matrix.push(row);
    });
    
    // Draw headers
    ctx.fillStyle = currentTheme === 'dark' ? '#e5e7eb' : '#374151';
    ctx.font = '10px Inter';
    
    // DTO headers (top)
    dtos.forEach((dto, i) => {
        ctx.save();
        ctx.translate((i + 1) * cellWidth + cellWidth / 2, 20);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText((dto.description || dto.id).substring(0, 20), 0, 0);
        ctx.restore();
    });
    
    // Controller headers (left)
    controllers.forEach((controller, i) => {
        ctx.textAlign = 'right';
        ctx.fillText((controller.description || controller.id).substring(0, 25), cellWidth - 5, (i + 1) * cellHeight + cellHeight / 2 + 40);
    });
    
    // Draw cells
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            const x = (j + 1) * cellWidth;
            const y = (i + 1) * cellHeight + 30;
            
            if (cell) {
                ctx.fillStyle = '#4f46e5';
                ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
            } else {
                ctx.fillStyle = currentTheme === 'dark' ? '#374151' : '#f3f4f6';
                ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
            }
        });
    });
}

// Dashboard View
function renderDashboardView() {
    try {
        renderOverviewChart();
        renderControllersChart();
        renderMethodsChart();
        renderDTOsChart();
    } catch (error) {
        console.error('Error rendering dashboard:', error);
    }
}

function renderOverviewChart() {
    const canvas = document.getElementById('overviewChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const controllers = mindmapData.nodes.filter(n => n.type === 'controller').length;
    const methods = mindmapData.nodes.filter(n => n.type === 'method').length;
    const dtos = mindmapData.nodes.filter(n => n.type === 'dto').length;
    
    try {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Controllers', 'Methods', 'DTOs'],
                datasets: [{
                    data: [controllers, methods, dtos],
                    backgroundColor: ['#4f46e5', '#ec4899', '#06b6d4']
                }
            ]},
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating overview chart:', error);
    }
}

function renderControllersChart() {
    const canvas = document.getElementById('controllersChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const controllerMethods = {};
    mindmapData.links.forEach(link => {
        if (link.type === 'contains') {
            controllerMethods[link.source] = (controllerMethods[link.source] || 0) + 1;
        }
    });
    
    const topControllers = Object.entries(controllerMethods)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    try {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topControllers.map(([id]) => {
                    const c = mindmapData.nodes.find(n => n.id === id);
                    return (c?.description || id).replace(' Controller', '');
                }),
                datasets: [{
                    label: 'Methods',
                    data: topControllers.map(([, count]) => count),
                    backgroundColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating controllers chart:', error);
    }
}

function renderMethodsChart() {
    const canvas = document.getElementById('methodsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const httpMethods = {};
    mindmapData.nodes.filter(n => n.type === 'method').forEach(method => {
        const httpMethod = method.metadata?.httpMethod || 'UNKNOWN';
        httpMethods[httpMethod] = (httpMethods[httpMethod] || 0) + 1;
    });
    
    try {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(httpMethods),
                datasets: [{
                    data: Object.values(httpMethods),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating methods chart:', error);
    }
}

function renderDTOsChart() {
    const canvas = document.getElementById('dtosChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dtoUsage = {};
    mindmapData.links.forEach(link => {
        const target = mindmapData.nodes.find(n => n.id === link.target);
        if (target && target.type === 'dto') {
            dtoUsage[target.id] = (dtoUsage[target.id] || 0) + 1;
        }
    });
    
    const topDTOs = Object.entries(dtoUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    try {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topDTOs.map(([id]) => {
                    const dto = mindmapData.nodes.find(n => n.id === id);
                    return (dto?.description || id).substring(0, 20);
                }),
                datasets: [{
                    label: 'Usage Count',
                    data: topDTOs.map(([, count]) => count),
                    backgroundColor: '#06b6d4'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating DTOs chart:', error);
    }
}

// Drag functions for force simulation
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Tooltip
function showNodeTooltip(event, d) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    let content = `<strong>${d.description || d.id}</strong><br/>`;
    content += `<em>Type: ${d.type}</em><br/>`;
    
    if (d.metadata) {
        if (d.metadata.httpMethod) content += `Method: ${d.metadata.httpMethod}<br/>`;
        if (d.metadata.route) content += `Route: ${d.metadata.route}<br/>`;
        if (d.metadata.namespace) content += `Namespace: ${d.metadata.namespace}<br/>`;
    }
    
    tooltip.innerHTML = content;
    tooltip.className = 'tooltip visible';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.className = 'tooltip';
    }
}

function highlightNode(event, d) {
    // Highlight connected nodes
    const connectedIds = new Set([d.id]);
    mindmapData.links.forEach(link => {
        if (link.source === d.id || link.source.id === d.id) {
            connectedIds.add(link.target.id || link.target);
        }
        if (link.target === d.id || link.target.id === d.id) {
            connectedIds.add(link.source.id || link.source);
        }
    });
    
    d3.selectAll('.node').classed('highlighted', n => connectedIds.has(n.id));
    d3.selectAll('.link').classed('highlighted', l => 
        (l.source.id === d.id || l.target.id === d.id)
    );
}

// Export Functions
function exportAsPNG() {
    try {
        // Check if html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            alert('Export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const element = document.querySelector(`#${currentView}View`);
        if (!element) {
            alert('Unable to find view element to export');
            return;
        }
        
        // Show loading indicator
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.innerHTML = 'Generating PNG...';
            tooltip.className = 'tooltip visible';
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        }
        
        html2canvas(element, {
            backgroundColor: currentTheme === 'dark' ? '#111827' : '#ffffff',
            scale: 2 // Higher quality
        }).then(canvas => {
            canvas.toBlob(blob => {
                if (blob) {
                    saveAs(blob, `api-mindmap-${currentView}-${Date.now()}.png`);
                    hideTooltip();
                } else {
                    throw new Error('Failed to create PNG blob');
                }
            });
        }).catch(error => {
            console.error('PNG export error:', error);
            hideTooltip();
            alert('Failed to export as PNG. Please try again or use a different export format.');
        });
    } catch (error) {
        console.error('PNG export error:', error);
        alert('Failed to export as PNG. Please try again.');
    }
}

function exportAsSVG() {
    try {
        const svgElement = document.querySelector(`#${currentView}View svg`);
        if (!svgElement) {
            alert('SVG export is only available for graph views (Mindmap, Tree, Dependency)');
            return;
        }
        
        // Check if saveAs is loaded
        if (typeof saveAs === 'undefined') {
            alert('Export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        saveAs(blob, `api-mindmap-${currentView}-${Date.now()}.svg`);
    } catch (error) {
        console.error('SVG export error:', error);
        alert('Failed to export as SVG. Please try again.');
    }
}

function exportAsPDF() {
    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('API Mindmap Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
        
        if (mindmapData) {
            doc.text(`Controllers: ${mindmapData.nodes.filter(n => n.type === 'controller').length}`, 20, 45);
            doc.text(`Methods: ${mindmapData.nodes.filter(n => n.type === 'method').length}`, 20, 52);
            doc.text(`DTOs: ${mindmapData.nodes.filter(n => n.type === 'dto').length}`, 20, 59);
            doc.text(`Links: ${mindmapData.links.length}`, 20, 66);
        }
        
        doc.save(`api-mindmap-report-${Date.now()}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Failed to export as PDF. Please try again.');
    }
}

function exportAsCSV() {
    try {
        if (!mindmapData) {
            alert('No data available to export');
            return;
        }
        
        // Check if saveAs is loaded
        if (typeof saveAs === 'undefined') {
            alert('Export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const methods = mindmapData.nodes.filter(n => n.type === 'method');
        
        let csv = 'Controller,Method,HTTP Method,Route,DTOs\n';
        
        methods.forEach(method => {
            const controllerLink = mindmapData.links.find(l => l.target === method.id && l.type === 'contains');
            const controller = controllerLink ? mindmapData.nodes.find(n => n.id === controllerLink.source) : null;
            
            const dtoLinks = mindmapData.links.filter(l => l.source === method.id && (l.type === 'returns' || l.type === 'accepts'));
            const dtos = dtoLinks.map(l => {
                const dto = mindmapData.nodes.find(n => n.id === l.target);
                return dto ? dto.description || dto.id : '';
            }).filter(d => d).join(';');
            
            csv += `"${controller?.description || ''}","${method.metadata?.actionName || ''}","${method.metadata?.httpMethod || ''}","${method.metadata?.route || ''}","${dtos}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        saveAs(blob, `api-mindmap-endpoints-${Date.now()}.csv`);
    } catch (error) {
        console.error('CSV export error:', error);
        alert('Failed to export as CSV. Please try again.');
    }
}

function exportAsJSON() {
    try {
        if (!mindmapData) {
            alert('No data available to export');
            return;
        }
        
        // Check if saveAs is loaded
        if (typeof saveAs === 'undefined') {
            alert('Export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        const blob = new Blob([JSON.stringify(mindmapData, null, 2)], { type: 'application/json' });
        saveAs(blob, `api-mindmap-data-${Date.now()}.json`);
    } catch (error) {
        console.error('JSON export error:', error);
        alert('Failed to export as JSON. Please try again.');
    }
}

function exportAsMarkdown() {
    try {
        if (!mindmapData) {
            alert('No data available to export');
            return;
        }
        
        // Check if saveAs is loaded
        if (typeof saveAs === 'undefined') {
            alert('Export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        let md = '# API Mindmap\n\n';
        md += `Generated: ${new Date().toLocaleString()}\n\n`;
        md += '## Statistics\n\n';
        md += `- **Controllers**: ${mindmapData.nodes.filter(n => n.type === 'controller').length}\n`;
        md += `- **Methods**: ${mindmapData.nodes.filter(n => n.type === 'method').length}\n`;
        md += `- **DTOs**: ${mindmapData.nodes.filter(n => n.type === 'dto').length}\n`;
        md += `- **Links**: ${mindmapData.links.length}\n\n`;
        
        md += '## Endpoints\n\n';
        
        const controllers = mindmapData.nodes.filter(n => n.type === 'controller');
        controllers.forEach(controller => {
            md += `### ${controller.description || controller.id}\n\n`;
            
            const methodLinks = mindmapData.links.filter(l => l.source === controller.id && l.type === 'contains');
            methodLinks.forEach(link => {
                const method = mindmapData.nodes.find(n => n.id === link.target);
                if (method) {
                    md += `- **${method.metadata?.httpMethod || ''}** \`${method.metadata?.route || ''}\` - ${method.metadata?.actionName || ''}\n`;
                }
            });
            md += '\n';
        });
        
        const blob = new Blob([md], { type: 'text/markdown' });
        saveAs(blob, `api-mindmap-${Date.now()}.md`);
    } catch (error) {
        console.error('Markdown export error:', error);
        alert('Failed to export as Markdown. Please try again.');
    }
}

function showError(message) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        console.error('Error:', message);
        alert(message);
        return;
    }
    
    tooltip.innerHTML = `<strong>Error:</strong> ${message}`;
    tooltip.className = 'tooltip visible';
    tooltip.style.left = '50%';
    tooltip.style.top = '50%';
    tooltip.style.background = 'rgba(220, 53, 69, 0.9)';
    tooltip.style.transform = 'translate(-50%, -50%)';
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;
            if (view) switchView(view);
        });
    });
    
    // Toolbar buttons
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadMindmapData();
        });
    }
    
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', zoomIn);
    }
    
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', zoomOut);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetView);
    }
    
    // Export menu
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.getElementById('exportMenu');
    if (exportBtn && exportMenu) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            exportMenu.classList.add('hidden');
        });
    }
    
    // Export options
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = btn.dataset.export;
            handleExport(format);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
    
    // Table filter input
    const tableSearchInput = document.getElementById('tableSearchInput');
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', (e) => {
            filterTable(e.target.value);
        });
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + Plus: Zoom in
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn();
        }
        
        // Ctrl/Cmd + Minus: Zoom out
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
        
        // R: Reset view
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            resetView();
        }
        
        // F: Toggle fullscreen
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // /: Focus search
        if (e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape: Clear search/highlights
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                handleSearch('');
            }
            clearHighlights();
        }
    });
}

// Search handler
function handleSearch(query) {
    if (!mindmapData) return;
    
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
        clearHighlights();
        return;
    }
    
    // Highlight matching nodes
    d3.selectAll('.node').classed('search-match', function(d) {
        if (!d) return false;
        const id = (d.id || '').toLowerCase();
        const desc = (d.description || '').toLowerCase();
        const type = (d.type || '').toLowerCase();
        return id.includes(lowerQuery) || desc.includes(lowerQuery) || type.includes(lowerQuery);
    });
}

// Table filter handler
function filterTable(query) {
    const tbody = document.getElementById('endpointsTableBody');
    if (!tbody) return;
    
    const lowerQuery = query.toLowerCase().trim();
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (!lowerQuery) {
            row.style.display = '';
            return;
        }
        
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
}

function clearHighlights() {
    d3.selectAll('.node').classed('highlighted', false).classed('search-match', false);
    d3.selectAll('.link').classed('highlighted', false);
}

// Export handler
function handleExport(format) {
    switch (format) {
        case 'png':
            exportAsPNG();
            break;
        case 'svg':
            exportAsSVG();
            break;
        case 'pdf':
            exportAsPDF();
            break;
        case 'csv':
            exportAsCSV();
            break;
        case 'json':
            exportAsJSON();
            break;
        case 'markdown':
            exportAsMarkdown();
            break;
        default:
            console.warn('Unknown export format:', format);
    }
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Zoom functions
function zoomIn() {
    const svgId = getSvgIdForCurrentView();
    if (!svgId) return;
    
    const svg = d3.select(`#${svgId}`);
    const currentZoom = d3.zoomTransform(svg.node());
    const newScale = currentZoom.k * 1.3;
    
    if (newScale <= 4) { // Max zoom level
        svg.transition().duration(300)
            .call(d3.zoom().transform, d3.zoomIdentity.translate(currentZoom.x, currentZoom.y).scale(newScale));
    }
}

function zoomOut() {
    const svgId = getSvgIdForCurrentView();
    if (!svgId) return;
    
    const svg = d3.select(`#${svgId}`);
    const currentZoom = d3.zoomTransform(svg.node());
    const newScale = currentZoom.k * 0.7;
    
    if (newScale >= 0.1) { // Min zoom level
        svg.transition().duration(300)
            .call(d3.zoom().transform, d3.zoomIdentity.translate(currentZoom.x, currentZoom.y).scale(newScale));
    }
}

function resetView() {
    const svgId = getSvgIdForCurrentView();
    if (!svgId) return;
    
    const svg = d3.select(`#${svgId}`);
    svg.transition().duration(500)
        .call(d3.zoom().transform, d3.zoomIdentity);
}

// Helper function to get the appropriate SVG ID for current view
function getSvgIdForCurrentView() {
    switch (currentView) {
        case 'mindmap':
            return 'mindmap';
        case 'tree':
            return 'treeCanvas';
        case 'dependency':
            return 'dependencyCanvas';
        default:
            return null;
    }
}
