interface AppConfig {
  name: string;
  github: {
    title: string;
    url: string;
  };
  author: {
    name: string;
    url: string;
  };
}

export const appConfig: AppConfig = {
  name: "Zona Verde App",
  github: {
    title: "Zona Verde",
    url: "https://github.com/hayyi2/zona_verde_app",
  },
  author: {
    name: "Equipe Zona Verde",
    url: "https://github.com/hayyi2",
  },
};
