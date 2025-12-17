// 应用程序配置文件
// 在这里可以设置应用的全局配置参数

export const appConfig = {
    // 基本配置
    version: '1.1.0',
    appName: 'SumiNav',
    
    // 网站启动时间配置 (ISO 8601格式，YYYY-MM-DDTHH:MM)
    // 可以根据需要修改这个时间，比如设置为当前时间的前一个小时
    startupTime: '2025-06-01T08:00',
    
    // GitHub项目配置
    githubProjectUrl: 'https://github.com/huang233893/SumiNav',
    
    // 时间配置
    time: {
        updateInterval: 60000, // 时间更新间隔（毫秒）
        format: 'HH:MM:SS'     // 时间显示格式
    },
    
    // 视图配置
    view: {
        defaultMode: 'grid',   // 默认视图模式：'grid' 或 'list'
        grid: {
            iconSize: 64,      // 网格视图图标大小（像素）
            spacing: 20        // 网格视图图标间距（像素）
        },
        list: {
            iconSize: 48,      // 列表视图图标大小（像素）
            spacing: 10        // 列表视图图标间距（像素）
        }
    },
    
    // 桌面配置
    desktop: {
        defaultWallpaper: 'default', // 默认壁纸，选项：'default', 'green', 'blue', 'custom'
        customWallpaper: '',         // 自定义壁纸URL,请填写custom后再填入链接
        taskbarPosition: 'bottom',   // 默认任务栏位置：'bottom' 或 'top'
        dragThreshold: 10,           // 拖拽阈值（像素）
        longPressDuration: 500       // 长按触发时间（毫秒）
    },
    
    // 链接配置
    links: {
        defaultIcon: '📂',           // 默认链接图标
        defaultCategory: '常用',     // 默认链接分类
        categories: ['常用', '工作', '学习', '娱乐', '工具'] // 可用分类列表
    },
    
    // 菜单配置
    menu: {
        showContextMenu: true,       // 是否显示右键菜单
        showStartMenu: true,         // 是否显示开始菜单
        startMenu: {
            buttonText: '🪟 开始',     // 开始菜单按钮文本
            items: [
                {
                    id: 'add-link',
                    icon: '📂',
                    text: '添加链接',
                    action: 'addLink'
                },
                {
                    id: 'toggle-view',
                    icon: '🔄',
                    text: '切换视图',
                    action: 'toggleView'
                },
                {
                    id: 'move-icon',
                    icon: '↔️',
                    text: '移动图标位置',
                    action: 'moveIcon'
                },
                {
                    id: 'settings',
                    icon: '⚙️',
                    text: '选项',
                    action: 'settings'
                },
                {
                    id: 'help',
                    icon: '❓',
                    text: '帮助菜单',
                    action: 'help'
                },
                {
                    id: 'about',
                    icon: 'ℹ️',
                    text: '关于',
                    action: 'about'
                },
                {
                    id: 'reset',
                    icon: '🔄',
                    text: '重置内容',
                    action: 'reset'
                }
            ]
        }
    },
    
    // 字体配置
    font: {
        defaultFont: 'CustomFont',   // 默认字体名称
        fallbackFonts: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'], // 后备字体列表
        useCustomFont: true          // 是否使用自定义字体
    },
    
    // SEO配置
    seo: {
        // 基本SEO标签
        title: '酥米的个人导航页',
        meta: {
            description: '酥米的个人导航页，宝藏网站的聚集地',
            keywords: '导航页,个人导航页,宝藏网站,聚集地',
            author: '酥米',
            robots: 'index, follow',
            revisitAfter: '7 days',
            rating: 'general'
        },
        
        // Open Graph标签
        openGraph: {
            title: '酥米的个人导航页',
            description: '酥米的个人导航页，宝藏网站的聚集地',
            type: 'website',
            url: 'https://my.sumi233.top',
            image: 'https://my.sumi233.top/favicon.ico',
            siteName: 'SumiNav'
        },
        
        // Twitter卡片标签
        twitter: {
            card: 'summary_large_image',
            title: '酥米的个人导航页',
            description: '酥米的个人导航页，宝藏网站的聚集地',
            image: 'https://my.sumi233.top/favicon.ico'
        }
    }
};
