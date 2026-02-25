import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleArrowUp,
  faCircleArrowDown,
  faClock,
  faBoltLightning,
  faArrowsRotate,
  faTruckMoving,
  faCircleCheck,
  faCirclePause,
  faPlay,
  faPause,
  faCircleQuestion,
  faXmark,
  faBolt,
  faSpinner,
  faStar,
  faWandMagicSparkles,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

// 添加到图标库
library.add(
  faCircleArrowUp,
  faCircleArrowDown,
  faClock,
  faBoltLightning,
  faArrowsRotate,
  faTruckMoving,
  faCircleCheck,
  faCirclePause,
  faPlay,
  faPause,
  faCircleQuestion,
  faXmark,
  faBolt,
  faSpinner,
  faStar,
  faWandMagicSparkles,
  faCirclePlus,
);

// 监听 DOM 变化自动替换 <i> 标签为 <svg>
export const initIcons = () => {
  dom.watch();
};
