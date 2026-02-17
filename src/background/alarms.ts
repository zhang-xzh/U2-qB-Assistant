import { ALARM_NAME } from '../utils';
import { syncQBStatus } from './sync';

export const setupAlarms = () => {
    // 定时任务：每 10 秒刷新一次 qB 状态
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 10 / 60 });

    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === ALARM_NAME) {
            await syncQBStatus();
        }
    });
};
