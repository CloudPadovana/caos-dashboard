interface ICaosSettings {
  LOCALE: string;

  CAOS_API_URL: string;
}

declare var CaosSettings: ICaosSettings;

export const SETTINGS = CaosSettings;
