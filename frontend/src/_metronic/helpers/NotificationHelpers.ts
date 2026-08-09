export const getNotificationUI = (type: string | undefined, title?: string) => {
    let finalType = type?.toLowerCase();

    // Guess type if missing based on title/message for improved aesthetics on old data
    if (!finalType && title) {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('order')) finalType = 'order';
        else if (lowerTitle.includes('shipment') || lowerTitle.includes('tracking')) finalType = 'shipment';
        else if (lowerTitle.includes('vendor')) finalType = 'vendor';
        else if (lowerTitle.includes('product')) finalType = 'product';
        else if (lowerTitle.includes('intigo')) finalType = 'intigo';
        else if (lowerTitle.includes('config') || lowerTitle.includes('setting')) finalType = 'config';
        else if (lowerTitle.includes('confirm')) finalType = 'confirm';
        else if (lowerTitle.includes('export')) finalType = 'export';
        else if (lowerTitle.includes('error') || lowerTitle.includes('alert')) finalType = 'error';
    }

    switch (finalType) {
        case 'order':
        case 'order_created':
        case 'orders':
            return { icon: 'basket', color: '#00C2FF', textColor: '#ffffff' }; // Electric Cyan
        case 'shipment':
        case 'shipment_created':
        case 'tracking':
            return { icon: 'delivery-3', color: '#FFB800', textColor: '#ffffff' }; // Golden Orange
        case 'export':
        case 'export_completed':
            return { icon: 'exit-up', color: '#7E8299', textColor: '#ffffff' }; // Steel Grey
        case 'user':
        case 'user_created':
        case 'users':
            return { icon: 'profile-circle', color: '#007AFF', textColor: '#ffffff' }; // Apple Blue
        case 'error':
        case 'alert':
            return { icon: 'cross-circle', color: '#FF3B30', textColor: '#ffffff' }; // Vibrant Alert Red
        case 'status':
        case 'status_updated':
        case 'order_status_update':
            return { icon: 'arrows-loop', color: '#F1416C', textColor: '#ffffff' }; // Rose Pink
        case 'bordereau':
        case 'bordereaux':
            return { icon: 'document', color: '#FF2D55', textColor: '#ffffff' }; // Vivid Crimson
        case 'intigo':
            return { icon: 'truck', color: '#5856D6', textColor: '#ffffff' }; // Electric Indigo
        case 'vendor':
        case 'vendors':
            return { icon: 'shop', color: '#34C759', textColor: '#ffffff' }; // Bright Success Green
        case 'product':
        case 'products':
            return { icon: 'package', color: '#AF52DE', textColor: '#ffffff' }; // Modern Purple
        case 'config':
            return { icon: 'setting-2', color: '#1C1C1E', textColor: '#ffffff' }; // Deep Onyx
        case 'confirm':
        case 'to-confirm':
            return { icon: 'check-circle', color: '#30D158', textColor: '#ffffff' }; // Mint Success
        default:
            return { icon: 'notification-on', color: '#8E8E93', textColor: '#ffffff' }; // iOS Style Grey
    }
};
