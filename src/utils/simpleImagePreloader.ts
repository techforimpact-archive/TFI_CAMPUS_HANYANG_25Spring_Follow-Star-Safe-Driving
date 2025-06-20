// src/utils/simpleImagePreloader.ts - 기존 파일 완전 교체

export const imagePaths = [
  '/assets/images/accident_fadeout.png',
'/assets/images/accident_turnoff_gfa.png',
'/assets/images/apple_box.png',
'/assets/images/back_button.png',
'/assets/images/background.png',
'/assets/images/blurred_vision.png',
'/assets/images/cap_hat_card.png',
'/assets/images/card_back.png',
'/assets/images/certificate_register_button.png',
'/assets/images/check.png',
'/assets/images/clap.png',
'/assets/images/completion_background.png',
'/assets/images/completion_background_conf.png',
'/assets/images/completion_background_long.png',
'/assets/images/confirm_button.png',
'/assets/images/dancing_star1.png',
'/assets/images/dancing_star2.png',
'/assets/images/dancing_star3.png',
'/assets/images/dancing_star4.png',
'/assets/images/danger_warning.png',
'/assets/images/depart_button.png',
'/assets/images/drag_button.png',
'/assets/images/drive_end_button.png',
'/assets/images/driving_farmland.png',
'/assets/images/driving_road.png',
'/assets/images/empty_star.png',
'/assets/images/encouragement_message_background.png',
'/assets/images/exit_button.png',
'/assets/images/farmland.png',
'/assets/images/field_road.png',
'/assets/images/field_work_background.png',
'/assets/images/filled_star.png',
'/assets/images/game_character_grandfather.png',
'/assets/images/game_character_grandmother.png',
'/assets/images/get_certificate.png',
'/assets/images/gift.png',
'/assets/images/gift_open.png',
'/assets/images/gorani_face.png',
'/assets/images/gorani_flash.png',
'/assets/images/gps_icon.png',
'/assets/images/grandchildren.png',
'/assets/images/grandchildren_happy.png',
'/assets/images/grandchildren_sad.png',
'/assets/images/granddaughter.png',
'/assets/images/grandfather_field_accident.png',
'/assets/images/grandfather_pothole_accident.png',
'/assets/images/grandfather_with_helmet.png',
'/assets/images/grandmother_field_accident.png',
'/assets/images/grandmother_pothole_accident.png',
'/assets/images/grandmother_with_helmet.png',
'/assets/images/grandson.png',
'/assets/images/helmet.png',
'/assets/images/helmet_card.png',
'/assets/images/home_button.png',
'/assets/images/homecoming_time_clocks.png',
'/assets/images/homecoming_time_setting_tree_road.png',
'/assets/images/kimchi.png',
'/assets/images/left_arrow_dark.png',
'/assets/images/left_arrow_light.png',
'/assets/images/letter_envelope.png',
'/assets/images/location_settings.png',
'/assets/images/makgeolli.png',
'/assets/images/makgeolli_cup.png',
'/assets/images/makgeolli_game_tray.png',
'/assets/images/meal_lady.png',
'/assets/images/meal_lady_background.png',
'/assets/images/medal_first.png',
'/assets/images/medal_second.png',
'/assets/images/medal_third.png',
'/assets/images/mission2_success_grandfather.png',
'/assets/images/mission2_success_grandmother.png',
'/assets/images/mission3_success.png',
'/assets/images/mission3_working_screen.png',
'/assets/images/mission4_motorcycle.png',
'/assets/images/mission4_success_grandfather_cart.png',
'/assets/images/mission4_success_grandmother_cart.png',
'/assets/images/mission5_fail_grandfather.png',
'/assets/images/mission5_fail_grandmother.png',
'/assets/images/mission5_success_grandfather.png',
'/assets/images/mission5_success_grandmother.png',
'/assets/images/mission_fail_evening_driving_grandfather.png',
'/assets/images/mission_fail_evening_driving_grandmother.png',
'/assets/images/motorcycle.png',
'/assets/images/motorcycle_side_view.png',
'/assets/images/next_button.png',
'/assets/images/noodles.png',
'/assets/images/orchard_arrival_screen.png',
'/assets/images/orchard_driving_road.png',
'/assets/images/perfect_awards.png',
'/assets/images/perfect_congrats.png',
'/assets/images/perfect_score_certificate.png',
'/assets/images/pre_drive_background.png',
'/assets/images/quest1.png',
'/assets/images/quest2.png',
'/assets/images/quest3.png',
'/assets/images/quest4.png',
'/assets/images/quest5.png',
'/assets/images/right_arrow_dark.png',
'/assets/images/right_arrow_light.png',
'/assets/images/road_with_small_pothole.png',
'/assets/images/scenario1.png',
'/assets/images/scenario1_full_map.png',
'/assets/images/scenario2.png',
'/assets/images/scenario3.png',
'/assets/images/scenario_success_confetti.png',
'/assets/images/score.png',
'/assets/images/score_background.png',
'/assets/images/select_button_dark.png',
'/assets/images/select_button_light.png',
'/assets/images/setting.png',
'/assets/images/small_pothole.png',
'/assets/images/sparrow.png',
'/assets/images/star_character.png',
'/assets/images/start_button.png',
'/assets/images/straw_hat_card.png',
'/assets/images/submit_button.png',
'/assets/images/success_background.png',
'/assets/images/success_background_blur.png',
'/assets/images/success_background_long 2.png',
'/assets/images/success_background_long.png',
'/assets/images/success_circle.png',
'/assets/images/success_road.png',
'/assets/images/success_road_background.png',
'/assets/images/sunset_scene_mountain.png',
'/assets/images/sunset_scene_sun.png',
'/assets/images/team_name.png',
'/assets/images/title.png',
'/assets/images/two_path_scene.png',
'/assets/images/work_complete_with_applebox.png',
'/assets/images/work_complete_without_applebox.png'
];

interface ImageCache {
  [key: string]: {
    element: HTMLImageElement;
    loaded: boolean;
    error: boolean;
  };
}

class SimpleImagePreloader {
  private cache: ImageCache = {};
  private loadPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private allLoadingPromise: Promise<void> | null = null;

  constructor() {
    this.allLoadingPromise = this.preloadAllImages();
  }

  private async preloadAllImages(): Promise<void> {
    console.log('[Preloader] 모든 이미지 로딩 시작');
    const promises = imagePaths.map(src => this.loadImage(src));
    await Promise.allSettled(promises);
    console.log('[Preloader] 모든 이미지 로딩 완료');
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache[src]?.loaded) {
      return this.cache[src].element;
    }

    if (this.loadPromises.has(src)) {
      return this.loadPromises.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.loading = 'eager';
      img.decoding = 'sync';

      const timeoutId = setTimeout(() => {
        console.warn(`[Preloader] 타임아웃: ${src}`);
        this.cache[src] = { element: img, loaded: false, error: true };
        reject(new Error(`Timeout: ${src}`));
      }, 15000);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.cache[src] = { element: img, loaded: true, error: false };
        resolve(img);
      };

      img.onerror = (error) => {
        clearTimeout(timeoutId);
        this.cache[src] = { element: img, loaded: false, error: true };
        console.error(`[Preloader] 로딩 실패: ${src}`, error);
        reject(error);
      };

      img.src = src;
    });

    this.loadPromises.set(src, promise);
    return promise;
  }

  isLoaded(src: string): boolean {
    return this.cache[src]?.loaded || false;
  }

  getImage(src: string): HTMLImageElement | null {
    return this.cache[src]?.element || null;
  }

  getLoadedCount(): number {
    return imagePaths.filter(src => this.isLoaded(src)).length;
  }

  getTotalCount(): number {
    return imagePaths.length;
  }

  getLoadProgress(): number {
    return Math.round((this.getLoadedCount() / this.getTotalCount()) * 100);
  }

  async waitForAllImages(): Promise<void> {
    if (this.allLoadingPromise) {
      await this.allLoadingPromise;
    }
  }

  clearCache() {
    this.cache = {};
    this.loadPromises.clear();
    this.allLoadingPromise = null;
  }
}

export const simpleImagePreloader = new SimpleImagePreloader();