import { ALARM_NAME } from '../utils';
import { syncQBStatus } from './sync';

export const setupAlarms = () => {
    // 后台低频兜底同步：每分钟广播一次状态
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === ALARM_NAME) {
            await syncQBStatus();
        }
    });
};
