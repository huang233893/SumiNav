// SumiNav - Windows 98风格导航页

// 导入默认链接配置、应用配置和窗口配置
import { defaultLinks } from './default-links.js';
import { appConfig } from './config.js';
import { windowConfig } from './windowConfig.js';

// 生成SEO标签函数
function generateSEOMetaTags() {
    const { seo } = appConfig;
    const head = document.head;
    
    // 设置页面标题
    document.title = seo.title;
    
    // 移除已存在的SEO相关meta标签，避免重复
    const existingMetaTags = head.querySelectorAll('[name^="twitter:"]');
    const existingOGTags = head.querySelectorAll('[property^="og:"]');
    const existingBasicMeta = head.querySelectorAll('[name="description"],[name="keywords"],[name="author"],[name="robots"],[name="revisit-after"],[name="rating"]');
    
    existingMetaTags.forEach(tag => tag.remove());
    existingOGTags.forEach(tag => tag.remove());
    existingBasicMeta.forEach(tag => tag.remove());
    
    // 生成基本SEO meta标签
    for (const [name, content] of Object.entries(seo.meta)) {
        // 将camelCase转换为kebab-case（用于revisitAfter → revisit-after）
        const metaName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
        const metaTag = document.createElement('meta');
        metaTag.name = metaName;
        metaTag.content = content;
        head.appendChild(metaTag);
    }
    
    // 生成Open Graph标签
    for (const [property, content] of Object.entries(seo.openGraph)) {
        // 将camelCase转换为snake_case（用于siteName → site_name）
        const ogProperty = property.replace(/([A-Z])/g, '_$1').toLowerCase();
        const ogTag = document.createElement('meta');
        ogTag.property = `og:${ogProperty}`;
        ogTag.content = content;
        head.appendChild(ogTag);
    }
    
    // 生成Twitter卡片标签
    for (const [name, content] of Object.entries(seo.twitter)) {
        const twitterTag = document.createElement('meta');
        twitterTag.name = `twitter:${name}`;
        twitterTag.content = content;
        head.appendChild(twitterTag);
    }
}

// 全局变量
let links = [];
let currentEditingLink = null;
let draggedElement = null;
let currentViewMode = 'grid'; // 'grid' 或 'list'
let activeCategory = '全部'; // 当前选中的分类
let isMoveIconMode = false; // 移动图标模式标志位

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // 生成SEO标签
    generateSEOMetaTags();
    
    // 加载本地存储的数据
    loadLinks();
    const settings = loadSettings();
    
    // 应用设置
    applySettings(settings);
    
    // 初始化窗口内容
    initializeWindows();
    
    // 生成开始菜单
    generateStartMenu();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 更新时间
    updateTime();
    setInterval(updateTime, appConfig.time.updateInterval);
    
    // 渲染分类标签和桌面图标
    renderCategoryTabs();
    renderDesktopIcons();
}

// 初始化窗口内容函数
function initializeWindows() {
    // 初始化开始菜单
    const startMenu = document.getElementById('start-menu');
    if (startMenu) {
        startMenu.innerHTML = windowConfig.startMenu.html;
    }

    // 初始化任务栏
    const taskbar = document.getElementById('taskbar');
    if (taskbar) {
        taskbar.innerHTML = windowConfig.taskbar.html;
    }

    // 初始化添加链接对话框
    const addLinkDialog = document.getElementById('add-link-dialog');
    if (addLinkDialog) {
        addLinkDialog.innerHTML = windowConfig.addLinkDialog.html;
    }

    // 初始化设置对话框
    const settingsDialog = document.getElementById('settings-dialog');
    if (settingsDialog) {
        settingsDialog.innerHTML = windowConfig.settingsDialog.html;
    }

    // 初始化帮助对话框
    const helpDialog = document.getElementById('help-dialog');
    if (helpDialog) {
        helpDialog.innerHTML = windowConfig.helpDialog.html;
    }

    // 初始化关于对话框
    const aboutDialog = document.getElementById('about-dialog');
    if (aboutDialog) {
        aboutDialog.innerHTML = windowConfig.aboutDialog.html;
    }

    // 初始化右键菜单
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.innerHTML = windowConfig.contextMenu.html;
    }

    // 初始化遮罩层（如果需要）
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.innerHTML = windowConfig.overlay.html;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 开始菜单
    const startButton = document.getElementById('start-button');
    const taskbarStart = document.getElementById('taskbar-start');
    if (startButton) {
        startButton.addEventListener('click', toggleStartMenu);
        startButton.textContent = appConfig.menu.startMenu.buttonText;
    }
    if (taskbarStart) {
        taskbarStart.addEventListener('click', toggleStartMenu);
        taskbarStart.textContent = appConfig.menu.startMenu.buttonText;
    }
    
    // GitHub项目按钮
    const githubButton = document.getElementById('github-project-btn');
    if (githubButton) {
        githubButton.addEventListener('click', () => {
            window.open(appConfig.githubProjectUrl, '_blank');
        });
    }
    
    // 分类菜单按钮
    const categoryMenuBtn = document.getElementById('category-menu-btn');
    if (categoryMenuBtn) {
        categoryMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止点击菜单时关闭菜单
            toggleCategoryDropdown();
        });
    }
    
    // 点击其他地方关闭分类菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-menu-container')) {
            closeCategoryDropdown();
        }
    });
    
    // 开始菜单项事件委托
    const startMenuItems = document.querySelector('.start-menu-items');
    if (startMenuItems) {
        startMenuItems.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.start-menu-item');
            if (!menuItem) return;
            
            const action = menuItem.dataset.action;
            closeStartMenu();
            
            switch (action) {
                case 'addLink':
                    currentEditingLink = null;
                    openAddLinkDialog();
                    break;
                case 'toggleView':
                    toggleViewMode();
                    break;
                case 'moveIcon':
                    // 进入/退出移动图标模式的逻辑
                    isMoveIconMode = !isMoveIconMode;
                    const desktop = document.getElementById('desktop');
                    if (desktop) {
                        if (isMoveIconMode) {
                            desktop.classList.add('move-icon-mode');
                            alert('已进入图标移动模式，长按并拖动图标即可调整位置\n再次点击移动图标位置可退出此模式');
                        } else {
                            desktop.classList.remove('move-icon-mode');
                            alert('已退出图标移动模式');
                        }
                    }
                    break;
                case 'settings':
                    openSettingsDialog();
                    break;
                case 'help':
                    openHelpDialog();
                    break;
                case 'about':
                    openAboutDialog();
                    break;
                case 'reset':
                    resetApp();
                    break;
            }
        });
    }
    
    // 壁纸选择事件监听器
    const wallpaperSelect = document.getElementById('wallpaper-select');
    if (wallpaperSelect) {
        wallpaperSelect.addEventListener('change', function() {
            const customWallpaperGroup = document.getElementById('custom-wallpaper-group');
            if (customWallpaperGroup) {
                customWallpaperGroup.style.display = this.value === 'custom' ? 'block' : 'none';
            }
        });
    }
    
    // 对话框关闭
    const closeDialogBtn = document.getElementById('close-dialog');
    const cancelBtn = document.getElementById('cancel-btn');
    if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeAddLinkDialog);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAddLinkDialog);
    
    // URL输入框事件监听，自动获取图标
    const linkUrlInput = document.getElementById('link-url');
    if (linkUrlInput) {
        linkUrlInput.addEventListener('blur', fetchFavicon);
        linkUrlInput.addEventListener('change', fetchFavicon);
    }
    
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsDialog);
    if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeSettingsDialog);
    
    const closeHelpBtn = document.getElementById('close-help');
    const closeHelpDialogBtn = document.getElementById('close-help-btn');
    if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelpDialog);
    if (closeHelpDialogBtn) closeHelpDialogBtn.addEventListener('click', closeHelpDialog);
    
    const closeAboutBtn = document.getElementById('close-about');
    const closeAboutDialogBtn = document.getElementById('close-about-btn');
    if (closeAboutBtn) closeAboutBtn.addEventListener('click', closeAboutDialog);
    if (closeAboutDialogBtn) closeAboutDialogBtn.addEventListener('click', closeAboutDialog);
    
    // 保存按钮
    const saveBtn = document.getElementById('save-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveLink);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    
    // 遮罩层点击关闭对话框
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeAllDialogs();
            closeStartMenu();
            closeContextMenu();
        });
    }
    
    // 右键菜单
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.desktop-icon')) {
            e.preventDefault();
            showContextMenu(e);
        }
    });
    
    // 右键菜单项
    const editLinkBtn = document.getElementById('edit-link');
    const deleteLinkBtn = document.getElementById('delete-link');
    if (editLinkBtn) editLinkBtn.addEventListener('click', editLink);
    if (deleteLinkBtn) deleteLinkBtn.addEventListener('click', deleteLink);
    
    // 点击空白处关闭右键菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            closeContextMenu();
        }
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDialogs();
            closeStartMenu();
            closeContextMenu();
        }
    });
}

function generateStartMenu() {
    const startMenuItems = document.querySelector('.start-menu-items');
    if (!startMenuItems) return;
    
    // 清空现有菜单项
    startMenuItems.innerHTML = '';
    
    // 获取当前设备类型（更精确的移动端判断）
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = window.innerWidth <= 900 && 
                    (userAgent.includes('mobile') || 
                     userAgent.includes('android') || 
                     userAgent.includes('iphone') || 
                     userAgent.includes('ipad'));
    
    // 根据配置生成菜单项
    appConfig.menu.startMenu.items.forEach(item => {
        // 过滤移动图标选项（仅移动端显示）
        if (item.id === 'move-icon' && !isMobile) return;
        
        const button = document.createElement('button');
        button.id = `${item.id}-btn`;
        button.className = 'start-menu-item';
        
        button.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span>${item.text}</span>
        `;
        
        // 存储动作类型
        button.dataset.action = item.action;
        
        startMenuItems.appendChild(button);
    });
}

// 动态生成分类选项
function generateCategoryOptions() {
    const categorySelect = document.getElementById('link-category');
    if (!categorySelect) return;
    
    // 清空现有选项
    categorySelect.innerHTML = '';
    
    // 获取所有分类（从配置文件获取基础分类，然后合并链接中的分类）
    const linkCategories = [...new Set(links.map(link => link.category))];
    const configCategories = appConfig.links.categories || [];
    // 合并分类并去重，保持配置文件中的顺序
    const categories = [...new Set([...configCategories, ...linkCategories])];
    
    // 为每个分类创建选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
}

// 对话框功能
function openAddLinkDialog() {
    const dialog = document.getElementById('add-link-dialog');
    const overlay = document.getElementById('overlay');
    
    if (!dialog || !overlay) return;
    
    // 动态生成分类选项
    generateCategoryOptions();
    
    // 清空或填充表单
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const linkIconInput = document.getElementById('link-icon');
    const linkCategorySelect = document.getElementById('link-category');
    
    if (currentEditingLink) {
        if (linkNameInput) linkNameInput.value = currentEditingLink.name;
        if (linkUrlInput) linkUrlInput.value = currentEditingLink.url;
        if (linkIconInput) linkIconInput.value = currentEditingLink.icon;
        if (linkCategorySelect) linkCategorySelect.value = currentEditingLink.category;
    } else {
        // 直接重置各个输入字段，因为对话框中没有form标签
        if (linkNameInput) linkNameInput.value = '';
        if (linkUrlInput) linkUrlInput.value = '';
        if (linkIconInput) linkIconInput.value = appConfig.links.defaultIcon;
        if (linkCategorySelect) linkCategorySelect.value = appConfig.links.defaultCategory;
    }
    
    dialog.classList.remove('hidden');
    overlay.classList.remove('hidden');
    
    // 聚焦到第一个输入框
    if (linkNameInput) linkNameInput.focus();
}

function closeAddLinkDialog() {
    document.getElementById('add-link-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    currentEditingLink = null;
}

function openSettingsDialog() {
    document.getElementById('settings-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeSettingsDialog() {
    document.getElementById('settings-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}





function openHelpDialog() {
    document.getElementById('help-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeHelpDialog() {
    document.getElementById('help-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

function openAboutDialog() {
    document.getElementById('about-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeAboutDialog() {
    document.getElementById('about-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

// 重置应用到默认状态
function resetApp() {
    if (confirm('确定要重置所有设置和链接吗？此操作不可恢复。')) {
        // 清除localStorage中的所有数据
        localStorage.removeItem('suminav-links');
        localStorage.removeItem('suminav-settings');
        
        // 重新加载默认链接
        links = [...defaultLinks];
        saveLinks();
        
        // 重新加载默认设置
        const settings = loadSettings();
        applySettings(settings);
        
        // 重新渲染桌面图标
        renderDesktopIcons();
        
        // 提示用户重置成功
        alert('应用已成功重置到默认状态！');
    }
}

function closeAllDialogs() {
    closeAddLinkDialog();
    closeSettingsDialog();
    closeHelpDialog();
    closeAboutDialog();
}

// 右键菜单功能
function showContextMenu(event) {
    const contextMenu = document.getElementById('context-menu');
    const desktopIcon = event.target.closest('.desktop-icon');
    
    if (!contextMenu || !desktopIcon) return;
    
    // 保存当前选中的链接ID
    window.currentLinkId = desktopIcon.dataset.id;
    
    // 计算菜单位置
    let x = event.clientX;
    let y = event.clientY;
    
    // 确保菜单不会超出屏幕
    if (x + contextMenu.offsetWidth > window.innerWidth) {
        x = window.innerWidth - contextMenu.offsetWidth;
    }
    if (y + contextMenu.offsetHeight > window.innerHeight) {
        y = window.innerHeight - contextMenu.offsetHeight;
    }
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
}

function closeContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.classList.add('hidden');
    }
    window.currentLinkId = null;
}

// 链接管理功能
function saveLink() {
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const linkIconInput = document.getElementById('link-icon');
    const linkCategorySelect = document.getElementById('link-category');
    
    if (!linkNameInput || !linkUrlInput || !linkIconInput || !linkCategorySelect) return;
    
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    const icon = linkIconInput.value.trim() || '📂';
    const category = linkCategorySelect.value;
    
    if (!name || !url) {
        alert('请填写名称和URL');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL格式（例如：https://example.com）');
        return;
    }
    
    if (currentEditingLink) {
        // 更新现有链接
        const linkIndex = links.findIndex(link => link.id === currentEditingLink.id);
        if (linkIndex !== -1) {
            links[linkIndex] = {
                ...links[linkIndex],
                name,
                url,
                icon,
                category,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // 添加新链接
        const newLink = {
            id: Date.now().toString(),
            name,
            url,
            icon,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        links.push(newLink);
    }
    
    // 保存到本地存储
    saveLinks();
    
    // 重新渲染桌面图标
    renderDesktopIcons();
    
    // 关闭对话框
    closeAddLinkDialog();
}

function editLink() {
    if (!window.currentLinkId) return;
    
    const link = links.find(link => link.id === window.currentLinkId);
    if (link) {
        currentEditingLink = link;
        openAddLinkDialog();
    }
    
    closeContextMenu();
}

function deleteLink() {
    if (!window.currentLinkId) return;
    
    if (confirm('确定要删除这个链接吗？')) {
        links = links.filter(link => link.id !== window.currentLinkId);
        saveLinks();
        renderDesktopIcons();
    }
    
    closeContextMenu();
}

// 渲染分类标签
function renderCategoryTabs() {
    const categoryTabsContainer = document.getElementById('category-tabs');
    if (!categoryTabsContainer) return;
    
    categoryTabsContainer.innerHTML = '';
    
    // 获取所有分类（从配置文件获取基础分类，然后合并链接中的分类）
    const linkCategories = [...new Set(links.map(link => link.category))];
    const configCategories = appConfig.links.categories || [];
    // 合并分类并去重，保持配置文件中的顺序
    const categories = ['全部', ...new Set([...configCategories, ...linkCategories])];
    
    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = `category-tab ${category === activeCategory ? 'active' : ''}`;
        tab.textContent = category;
        tab.addEventListener('click', () => {
            activeCategory = category;
            renderCategoryTabs();
            renderCategoryDropdown();
            renderDesktopIcons();
        });
        categoryTabsContainer.appendChild(tab);
    });
    
    // 同时更新分类菜单
    renderCategoryDropdown();
}

// 分类菜单功能
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

function closeCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

function renderCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    // 获取所有分类（从配置文件获取基础分类，然后合并链接中的分类）
    const linkCategories = [...new Set(links.map(link => link.category))];
    const configCategories = appConfig.links.categories || [];
    // 合并分类并去重，保持配置文件中的顺序
    const categories = ['全部', ...new Set([...configCategories, ...linkCategories])];
    
    categories.forEach(category => {
        const item = document.createElement('button');
        item.className = `category-dropdown-item ${category === activeCategory ? 'active' : ''}`;
        item.textContent = category;
        item.addEventListener('click', () => {
            activeCategory = category;
            renderCategoryTabs();
            renderCategoryDropdown();
            renderDesktopIcons();
            closeCategoryDropdown();
        });
        dropdown.appendChild(item);
    });
}

// 渲染桌面图标
function renderDesktopIcons() {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    
    desktop.innerHTML = '';
    
    // 应用当前视图模式
    if (currentViewMode === 'list') {
        desktop.classList.add('list-view');
    } else {
        desktop.classList.remove('list-view');
    }
    
    // 过滤显示的链接
    const filteredLinks = activeCategory === '全部' 
        ? links 
        : links.filter(link => link.category === activeCategory);
    
    filteredLinks.forEach(link => {
        const iconElement = createDesktopIcon(link);
        desktop.appendChild(iconElement);
    });
}

// 切换视图模式
function toggleViewMode() {
    currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
    renderDesktopIcons();
    saveSettings(); // 自动保存当前视图模式
}

// 创建桌面图标
function createDesktopIcon(link) {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'desktop-icon';
    iconDiv.dataset.id = link.id;
    
    // 添加拖拽功能
    iconDiv.draggable = true;
    iconDiv.addEventListener('dragstart', handleDragStart);
    iconDiv.addEventListener('dragend', handleDragEnd);
    iconDiv.addEventListener('dragover', handleDragOver);
    iconDiv.addEventListener('drop', handleDrop);
    
    // 移动端触摸事件支持
    let longPressTimer;
    let touchStartX;
    let touchStartY;
    let isLongPress = false; // 长按标志位
    
    // 触摸开始
    iconDiv.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止滚动
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isLongPress = false;
        
        // 设置长按定时器
        longPressTimer = setTimeout(() => {
            // 长按显示右键菜单
            isLongPress = true;
            const event = new MouseEvent('contextmenu', {
                clientX: touchStartX,
                clientY: touchStartY,
                bubbles: true,
                cancelable: true
            });
            iconDiv.dispatchEvent(event);
        }, 800); // 长按触发时间（800ms）
    });
    
    // 触摸移动
    iconDiv.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        // 移动距离超过阈值，取消长按
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const distance = Math.sqrt(
            Math.pow(touchX - touchStartX, 2) + 
            Math.pow(touchY - touchStartY, 2)
        );
        
        if (distance > 10 && longPressTimer) { // 10px的阈值
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
    
    // 触摸结束
    iconDiv.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // 清除长按定时器
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
            
            // 短按打开链接
            if (!isLongPress) {
                window.open(link.url, '_blank');
            }
        }
    });
    
    // 点击打开链接
    iconDiv.addEventListener('click', (e) => {
        // 如果是长按触发的，不打开链接
        if (!isLongPress) {
            window.open(link.url, '_blank');
        }
        // 重置长按标志
        isLongPress = false;
    });
    
    // 图标内容
    let iconContent;
    if (link.icon.startsWith('http://') || link.icon.startsWith('https://')) {
        // 如果是URL图标，使用img标签显示
        iconContent = `<img src="${link.icon}" alt="${link.name}" class="icon-content">`;
    } else {
        // 否则显示emoji
        iconContent = `<span class="icon-content">${link.icon}</span>`;
    }
    
    iconDiv.innerHTML = `
        <div class="icon-container">
            ${iconContent}
        </div>
        <div class="label-container">
            <span class="icon-label">${link.name}</span>
        </div>
    `;
    
    return iconDiv;
}

// 拖拽功能
function handleDragStart(e) {
    draggedElement = e.target.closest('.desktop-icon');
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const targetElement = e.target.closest('.desktop-icon');
    
    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const draggedId = draggedElement.dataset.id;
        const targetId = targetElement.dataset.id;
        
        const draggedIndex = links.findIndex(link => link.id === draggedId);
        const targetIndex = links.findIndex(link => link.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // 重新排序链接
            const [movedLink] = links.splice(draggedIndex, 1);
            links.splice(targetIndex, 0, movedLink);
            
            // 保存并重新渲染
            saveLinks();
            renderDesktopIcons();
        }
    }
}

// 设置功能
function saveSettings() {
    const wallpaperSelect = document.getElementById('wallpaper-select');
    const customWallpaperInput = document.getElementById('custom-wallpaper');
    const taskbarPositionSelect = document.getElementById('taskbar-position');
    
    const wallpaper = wallpaperSelect ? wallpaperSelect.value : 'default';
    const customWallpaper = wallpaper === 'custom' && customWallpaperInput ? customWallpaperInput.value : '';
    const taskbarPosition = taskbarPositionSelect ? taskbarPositionSelect.value : 'bottom';
    
    // 保存设置
    const settings = {
        wallpaper,
        customWallpaper,
        taskbarPosition,
        viewMode: currentViewMode, // 保存当前视图模式
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('suminav-settings', JSON.stringify(settings));
    
    // 应用设置
    applySettings(settings);
    
    // 如果有设置对话框则关闭
    if (document.getElementById('settings-dialog')) {
        closeSettingsDialog();
    }
}



function applySettings(settings) {
    const body = document.body;
    const taskbar = document.getElementById('taskbar');
    const desktop = document.getElementById('desktop');
    
    // 移除所有壁纸类
    body.classList.remove('wallpaper-blue', 'wallpaper-green', 'wallpaper-purple');
    
    // 应用壁纸设置
    if (settings.wallpaper) {
        if (settings.wallpaper === 'custom' && settings.customWallpaper) {
            body.style.backgroundImage = `url(${settings.customWallpaper})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
        } else if (settings.wallpaper !== 'default') {
            body.classList.add(`wallpaper-${settings.wallpaper}`);
            body.style.backgroundImage = '';
        } else {
            body.style.backgroundImage = '';
        }
    }
    
    // 应用任务栏位置设置
    if (settings.taskbarPosition) {
        // 移除所有位置类
        taskbar.classList.remove('top', 'bottom');
        // 添加当前位置类
        taskbar.classList.add(settings.taskbarPosition);
    } else {
        // 默认在底部
        taskbar.classList.remove('top');
        taskbar.classList.add('bottom');
    }
    
    // 应用视图模式设置
    if (settings.viewMode) {
        currentViewMode = settings.viewMode;
        // 更新桌面视图类
        if (currentViewMode === 'list') {
            desktop.classList.add('list-view');
        } else {
            desktop.classList.remove('list-view');
        }
    }
}

// 开始菜单功能
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const taskbar = document.getElementById('taskbar');
    
    if (!startMenu || !taskbar) return;
    
    if (startMenu.classList.contains('hidden')) {
        startMenu.classList.remove('hidden');
        
        // 根据任务栏位置调整开始菜单位置
        const taskbarPosition = taskbar.classList.contains('top') ? 'top' : 'bottom';
        if (taskbarPosition === 'top') {
            startMenu.style.bottom = 'auto';
            startMenu.style.top = `${taskbar.offsetHeight}px`;
        } else {
            startMenu.style.top = 'auto';
            startMenu.style.bottom = `${taskbar.offsetHeight}px`;
        }
    } else {
        startMenu.classList.add('hidden');
    }
}

// 更新网站运行时间
function updateTime() {
    // 从配置文件中获取启动时间
    let startTime = new Date(appConfig.startupTime);
    
    // 确保startupTime是有效的日期
    if (isNaN(startTime.getTime())) {
        startTime = new Date(); // 如果无效，使用当前时间
    }
    
    const now = new Date();
    
    // 计算运行时间差值（毫秒）
    const diffMs = now - startTime;
    
    // 转换为小时、分钟、秒
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // 格式化时间字符串
    const timeString = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
    
    // 更新显示
    const currentTimeElement = document.getElementById('current-time');
    const taskbarTimeElement = document.getElementById('taskbar-time');
    
    if (currentTimeElement) {
        currentTimeElement.textContent = `运行时间 ${timeString}`;
    }
    if (taskbarTimeElement) {
        taskbarTimeElement.textContent = timeString;
    }
}

// 本地存储功能
function saveLinks() {
    localStorage.setItem('suminav-links', JSON.stringify(links));
}

function loadLinks() {
    const savedLinks = localStorage.getItem('suminav-links');
    if (savedLinks) {
        links = JSON.parse(savedLinks);
    } else {
        // 使用导入的默认链接配置
        links = [...defaultLinks];
        saveLinks();
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('suminav-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // 更新设置对话框的值
        const wallpaperSelect = document.getElementById('wallpaper-select');
        if (wallpaperSelect) wallpaperSelect.value = settings.wallpaper || 'default';
        
        const taskbarPositionSelect = document.getElementById('taskbar-position');
        if (taskbarPositionSelect) taskbarPositionSelect.value = settings.taskbarPosition || 'bottom';
        
        // 更新自定义壁纸输入框
        if (settings.wallpaper === 'custom') {
            const customWallpaperGroup = document.getElementById('custom-wallpaper-group');
            if (customWallpaperGroup) customWallpaperGroup.style.display = 'block';
            
            const customWallpaperInput = document.getElementById('custom-wallpaper');
            if (customWallpaperInput) customWallpaperInput.value = settings.customWallpaper || '';
        }
        
        return settings;
    } else {
        // 返回默认设置（从配置文件获取）
        const defaultSettings = {
            viewMode: appConfig.view.defaultMode,
            wallpaper: appConfig.desktop.defaultWallpaper,
            customWallpaper: appConfig.desktop.customWallpaper,
            taskbarPosition: appConfig.desktop.taskbarPosition
        };
        
        return defaultSettings;
    }
}

// 重置应用


// 工具函数
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 自动获取网站图标
function fetchFavicon() {
    const urlInput = document.getElementById('link-url');
    const iconInput = document.getElementById('link-icon');
    const url = urlInput.value.trim();
    
    if (!url) return;
    
    try {
        const parsedUrl = new URL(url);
        // 使用Google Favicon Service获取图标URL
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.origin}&sz=64`;
        
        // 检查favicon是否存在
        const img = new Image();
        img.onload = function() {
            // 保存图标URL作为图标值
            iconInput.value = faviconUrl;
        };
        img.onerror = function() {
            // 如果获取失败，保持默认图标
            console.log('无法获取网站图标，使用默认图标');
        };
        img.src = faviconUrl;
    } catch (e) {
        // URL格式错误，不处理
    }
}

// 响应式处理
// 窗口大小变化事件处理
let lastWindowHeight = window.innerHeight;
window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    
    // 检测是否是手机端输入法导致的窗口高度变化
    // 当输入法弹出时，通常窗口高度会减少，而宽度不变
    const isKeyboardShown = currentHeight < lastWindowHeight;
    
    // 仅在不是输入法导致的窗口变化时关闭菜单和对话框
    if (!isKeyboardShown) {
        closeStartMenu();
        closeContextMenu();
    }
    
    // 更新最后窗口高度
    lastWindowHeight = currentHeight;
});

// 导出全局函数（用于调试）
window.sumiNav = {
    links,
    loadLinks,
    saveLinks,
    renderDesktopIcons
};