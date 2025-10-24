import { useEffect } from 'react';
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
    // Replace with your analytics service
    console.log(metric);
};

export const WebVitals = () => {
    useEffect(() => {
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getLCP(sendToAnalytics);
        getFCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
    }, []);

    return null;
};

export const vitalsObserver = {
    observe: () => {
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getLCP(sendToAnalytics);
        getFCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
    }
};
