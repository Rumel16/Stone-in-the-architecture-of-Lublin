require([
    "esri/layers/FeatureLayer",
    "esri/Map",
    "esri/views/SceneView",
    "esri/widgets/Legend"
  ],

  function (FeatureLayer, Map, SceneView, Legend) {

    var renderer2 = {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [{
          type: "extrude",
          size: 30,
          material: {
            color: "#8c8c8c"
          },
          edges: {
            type: "solid",
            color: [0, 0, 0, 0]
          }
        }]
      },
      visualVariables: [{
        type: "size",
        field: "wys_z",
        valueUnit: "meters"
      }]
    };

    var renderer = {
      type: "simple",
      // Ustawianie symbolu jaki ma być renderowany
      symbol: {
        type: "polygon-3d",
        symbolLayers: [{
          // Wybranie wypietrzętrzania symblu
          type: "extrude",
          size: 30,
          // Wybranie koloru w zapisie szesnastkowym
          material: {
            color: "#f9ff93"
          },
          // Ustawienie konturu symboli
          edges: {
            type: "solid",
            color: [0, 0, 0, 0.5]
          }
        }]
      },
      // Wskazanie z którego pola zmienna ma pobierać wysokość
      visualVariables: [{
        type: "size",
        field: "wys_z",
        valueUnit: "meters"
      }]
    };
    // Konstruktor warstwy budynków.
    var buildingsLayer = new FeatureLayer({
      url: "https://services9.arcgis.com/xQbsz5OvVcwLPf2h/arcgis/rest/services/Budynki/FeatureServer",
      // Zmienna definiująca styl warstwy.
      renderer: renderer,
      // Konfigurowanie wyskakujących okienek (pop-up).
      popupTemplate: {
        title: "Budynek",
        content: [{
          type: "fields",
          fieldInfos: [{
              fieldName: "f_bud",
              label: "Funkcja: "
            },
            {
              fieldName: "stan_na__1",
              label: "Rok budowy: "
            },
            {
              fieldName: "skaly",
              label: "Użyte kamienie: "
            },
            {
              fieldName: "nazwa",
              label: "Dzielnica: "
            }
          ]
        }]
      },
      // Wskazanie warunku do wyświetlania budynku.
      definitionExpression: "wys_z > 0"
    });

    var zabudowa = new FeatureLayer({
      url: "https://services9.arcgis.com/xQbsz5OvVcwLPf2h/arcgis/rest/services/Zabudowa/FeatureServer",
      renderer: renderer2,
      popupTemplate: {
        title: "Budynek bez określonych skał",
        content: [{
          type: "fields",
          fieldInfos: [{
              fieldName: "f_bud",
              label: "Funkcja: "
            },
            {
              fieldName: "stan_na__1",
              label: "Rok budowy: "
            },
            {
              fieldName: "nazwa",
              label: "Dzielnica: "
            }
          ]
        }]
      },
      definitionExpression: "wys_z > 0"
    });

    var map = new Map({
      // Ustawienie mapy podkładowej.
      basemap: "dark-gray-vector",
      // Ustawienie wypiętrzenia gruntu.
      ground: "world-elevation",
      // Dodanie warstw do mapy.
      layers: [buildingsLayer, zabudowa]
    });


    document.getElementById("query").onclick = Radio;
    document.getElementById("highlight").onclick = delH;
    var highlight = null;

    function Radio() {
      // Pobranie wszystkich obiektów radio
      let radio = document.getElementsByClassName('w3-radio');
      // Stworzenie pustej tablicy
      let radioSelected = [];
      // Iterowanie po obiektach radio
      for (let i = 0; i < radio.length; i++) {
        // Jeżeli przycisk został zaznaczony
        if (radio[i].checked) {
          // Pobieranie wartości
          b = radio[i].value;
          // Dodanie wartości do tablicy
          radioSelected.push(b);
          // Jeżeli zapytanie zostało wykonane wcześniej
          if (highlight) {
            // Usunięcie podświetlenia
            highlight.remove();
          }
          // Wykonanie funkcji dla pobranej wartości 
          Zapytaj(b);
        }
      }
    }

    function Zapytaj(b) {
      mapview.whenLayerView(buildingsLayer).then(function (layerView) {
        // Utworzenie obiektu Query
        let query = buildingsLayer.createQuery();
        // Wypełnienie parametru zapytaniem
        query.where = "skaly LIKE '%" + b + "%'";
        // Wypełnienie parametru geometrii
        query.returnQueryGeometry = true
        // Podświetlenie obiektów spełniających zapytanie
        buildingsLayer.queryFeatures(query).then(function (result) {
          highlight = layerView.highlight(result.features);
        })
        // Przystosowanie widoku kamery do zasięgu podświetlenia
        buildingsLayer.queryExtent().then(function (response) {
          mapview.goTo(response.extent);
        })
      });
    }

    function delH() {
      if (highlight) {
        highlight.remove();
      }
    }

    var mapview = new SceneView({
      // Wskazanie id kontenera Div, w którym jest mapa
      container: "viewDiv",
      // Wskazanie wcześniej utworzonej mapy
      map: map,
      // Ustawienie kamery
      camera: {
        position: {
          x: 22.5601606,
          y: 51.2256211,
          z: 3000,
          spatialReference: {
            wkid: 4326
          }
        },
        heading: 0,
        tilt: 50
      },
      // Ustawienie efektów środowiska
      environment: {
        atmosphere: {
          quality: "high"
        },
        // Wlaczenie naslonecznienia
        lighting: {
          // Pobranie aktualnej daty i kąta padania promieni slonecznych
          date:"Sun APR 15 2019 12:00:00 GMT+0100 (CET)",
          // Wlaczenie cieniowania
          directShadowsEnabled: true,
          cameraTrackingEnabled: false
        }
      },
      // Włączenie i skonfigurowanie opcji podświetlania
      highlightOptions: {
        color: [255, 0, 0, 1],
        haloOpacity: 0.6,
        fillOpacity: 0.2
      }});

    // Pobranie i przypisanie do elementu wykonanie funkcji.
    document
      .getElementById("poraDnia")
      .addEventListener("change", zmienPoreDnia);

    function zmienPoreDnia(ev) {
      var select = ev.target;
      // Pobranie wartości wybranej przez użytkownika.
      var date = select.options[select.selectedIndex].value;
      // Zmiana pory dnia.
      mapview.environment.lighting.date = new Date(date);
    }

    var legend = new Legend({
      // Wskazanie sceny
      view: mapview,
      // Nadanie warstwom etykiet w legendzie.
      layerInfos: [{
          layer: zabudowa,
          title: "Budynki bez określonych skał",
        },
        {
          layer: buildingsLayer,
          title: "Budynki z określonymi skałami"
        }
      ]});

    mapview.ui.add(legend, "bottom-left");

  });

  function m_open() {
    document.getElementById("infoDiv").style.display = "block";
    document.getElementById("infoDiv").style.height = "60%";
  }
  
  function m_close() {
    document.getElementById("infoDiv").style.display = "none";
  }
