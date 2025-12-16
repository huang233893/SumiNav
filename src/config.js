// 应用程序配置文件
// 在这里可以设置应用的全局配置参数

export const appConfig = {
    // 基本配置
    version: '1.0.0',
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
        taskbarPosition: 'top',   // 默认任务栏位置：'bottom' 或 'top'
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
        showStartMenu: true          // 是否显示开始菜单
    }
};
