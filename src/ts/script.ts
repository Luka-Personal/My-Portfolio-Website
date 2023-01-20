import { MOUSE_OVER_ANIM_STRENGTH } from "./config";
import { CV_LINK } from "./config";
// ###########################
// ADDNIG MOUSE HOVER ANIM
// ###########################
function binder(_: any, _2: any, descriptor: PropertyDescriptor) {
  const originalFunction = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundedFn = originalFunction.bind(this);
      return boundedFn;
    },
  };
  return newDescriptor;
}
const projectContainer = document.querySelectorAll<HTMLDivElement>(`.project-box`);
class MouseTrackerAnim {
  constructor(private strengthAnim: number, private toAnimateEls: HTMLElement[], private clearOnMouseOut: boolean) {
    if (Array.isArray(this.toAnimateEls)) {
      this.toAnimateEls.forEach((el) => {
        el.addEventListener(`mousemove`, this.callbackHover);
        if (this.clearOnMouseOut) {
          el.addEventListener(`mouseout`, this.callbackOut);
        }
      });
    }
  }
  @binder
  callbackHover(e: any) {
    let bounds = e.target.closest(`.project-box`).getBoundingClientRect();
    let xPos = e.clientX - bounds.left;
    let yPos = e.clientY - bounds.top;
    let contWidth = e.target.closest(`.project-box`).clientWidth / 2;
    let contHeight = e.target.closest(`.project-box`).clientHeight / 2;
    e.target.closest(`.project-box`).style.transform = `rotateX(${(contWidth - xPos) / this.strengthAnim}deg) rotateY(${(contHeight - yPos) / this.strengthAnim}deg) perspective(1px) translateZ(0)`;
  }
  callbackOut(e: any) {
    e.target.closest(`.project-box`).style.transform = `perspective(1px) translateZ(0)`;
  }
}
const mouseOverAnim = new MouseTrackerAnim(MOUSE_OVER_ANIM_STRENGTH, Array.from(projectContainer), true);
// ###########################
// ADDING ONLOAD OBSERVER ANIM
// ###########################
const skillLogos = document.querySelector(`.skills-logos`) as HTMLDivElement;
const projectBoxes = document.querySelectorAll<HTMLDivElement>(`.project-box`);
class MainObserver {
  private observer: IntersectionObserver | undefined;
  constructor(private toObserveEl: HTMLElement | HTMLElement[], private obsOptions: IntersectionObserverInit, private intersectFn?: Function, private nonIntersectFn?: Function) {
    this.setObserver();
  }
  private setObserver() {
    this.observer = new IntersectionObserver(this.callBack, this.obsOptions);
    if (Array.isArray(this.toObserveEl)) {
      this.toObserveEl.forEach((el) => {
        this.observer?.observe(el);
      });
    } else {
      this.observer?.observe(this.toObserveEl);
    }
  }
  @binder
  private callBack(ev: IntersectionObserverEntry[]) {
    const [event] = ev;
    if (event.isIntersecting) {
      this.intersectFn?.(event.target);
    } else {
      this.nonIntersectFn?.(event.target);
    }
  }
}
const skillsAnim = new MainObserver(skillLogos, { root: null, threshold: 0 }, () => {
  skillLogos.querySelectorAll(`li`).forEach((li) => li.classList.add(`skills-logos__anim`));
});
const projectsAnim = new MainObserver(Array.from(projectBoxes), { root: null, threshold: 0 }, (target: HTMLElement) => (target.style.opacity = `1`));
// ###########################
// JUST ANCHOR/LINK CONFIGS
// ###########################
const cvAnchorElement = document.querySelector(`.main-link__normal`) as HTMLAnchorElement;
(() => {
  cvAnchorElement.href = CV_LINK;
})();
// ###########################
// TESTING
// ###########################
class DarkModeListener {
  private rootElement = document.querySelector(`:root`) as HTMLElement;
  private headerMenuBtn = document.querySelector(`menu`) as HTMLMenuElement;
  private matchDark = window.matchMedia(`(prefers-color-scheme: dark)`);
  private matchLight = window.matchMedia(`(prefers-color-scheme: light)`);
  private rootElementStyle = this.rootElement.style;
  private localStorageLight = localStorage.getItem(`light-theme__key`);
  private localStorageDark = localStorage.getItem(`dark-theme__key`);
  constructor() {
    this.rootElementStyle.colorScheme = `light`;
    this.matchMediaOnLoad();
    this.matchDark.addEventListener(`change`, this.matchMediaCb);
    this.headerMenuBtn.addEventListener(`click`, this.headerMenuBtnCb);
    this.checkLocalStorage();
  }
  private matchMediaOnLoad() {
    if (this.matchDark.matches) {
      this.modeDark();
    }
    if (!this.matchLight.matches) {
      this.modeLight();
    }
  }
  private modeDark() {
    this.rootElement.style.colorScheme = `dark`;
    document.body.classList.add(`dark`);
  }
  private modeLight() {
    this.rootElement.style.colorScheme = `light`;
    document.body.classList.remove(`dark`);
  }
  @binder
  private matchMediaCb(e: MediaQueryListEvent) {
    if (e.matches && this.localStorageLight !== `light`) {
      this.modeDark();
    }
    if (!e.matches && this.localStorageDark !== `dark`) {
      this.modeLight();
    }
  }
  private toggleScheme() {
    document.body.classList.toggle(`dark`);
    this.rootElement.style.colorScheme = this.rootElement.style.colorScheme === `light` ? `dark` : `light`;
  }
  @binder
  private headerMenuBtnCb() {
    this.toggleScheme();
    if (this.rootElementStyle.colorScheme === `light`) {
      localStorage.removeItem(`dark-theme__key`);
      localStorage.setItem(`light-theme__key`, `light`);
    }
    if (this.rootElementStyle.colorScheme === `dark`) {
      localStorage.removeItem(`light-theme__key`);
      localStorage.setItem(`dark-theme__key`, `dark`);
    }
  }
  private checkLocalStorage() {
    if (this.localStorageDark === `dark`) {
      this.modeDark();
    }
    if (this.localStorageLight === `light`) {
      this.modeLight();
    }
  }
}
const themeLogic = new DarkModeListener();
