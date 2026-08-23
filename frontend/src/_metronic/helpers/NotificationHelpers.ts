export const getNotificationUI = (type: string | undefined, title?: string) => {
    let finalType = type?.toLowerCase();

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
            return { icon: 'basket', color: '#00C2FF', textColor: '#ffffff' }; 
        case 'shipment':
        case 'shipment_created':
        case 'tracking':
            return { icon: 'delivery-3', color: '#FFB800', textColor: '#ffffff' }; 
        case 'export':
        case 'export_completed':
            return { icon: 'exit-up', color: '#7E8299', textColor: '#ffffff' }; 
        case 'user':
        case 'user_created':
        case 'users':
            return { icon: 'profile-circle', color: '#007AFF', textColor: '#ffffff' }; 
        case 'error':
        case 'alert':
            return { icon: 'cross-circle', color: '#FF3B30', textColor: '#ffffff' }; 
        case 'status':
        case 'status_updated':
        case 'order_status_update':
            return { icon: 'arrows-loop', color: '#F1416C', textColor: '#ffffff' }; 
        case 'bordereau':
        case 'bordereaux':
            return { icon: 'document', color: '#FF2D55', textColor: '#ffffff' }; 
        case 'intigo':
            return { icon: 'truck', color: '#5856D6', textColor: '#ffffff' }; 
        case 'vendor':
        case 'vendors':
            return { icon: 'shop', color: '#34C759', textColor: '#ffffff' }; 
        case 'product':
        case 'products':
            return { icon: 'package', color: '#AF52DE', textColor: '#ffffff' }; 
        case 'config':
            return { icon: 'setting-2', color: '#1C1C1E', textColor: '#ffffff' }; 
        case 'confirm':
        case 'to-confirm':
            return { icon: 'check-circle', color: '#30D158', textColor: '#ffffff' }; 
        default:
            return { icon: 'notification-on', color: '#8E8E93', textColor: '#ffffff' }; 
    }
};