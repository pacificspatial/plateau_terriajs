import * as geoJsonMerge from "@mapbox/geojson-merge";
import i18next from "i18next";
import * as shp from "shpjs";
import JsonValue, { isJsonArray } from "../Core/Json";
import CatalogMemberMixin from "../ModelMixins/CatalogMemberMixin";
import GeoJsonMixin from "../ModelMixins/GeojsonMixin";
import ShapefileCatalogItemTraits from "../Traits/ShapefileCatalogItemTraits";
import CreateModel from "./CreateModel";
import { JsonObject } from "./../Core/Json";
import makeRealPromise from "../Core/makeRealPromise";
import readJson from "../Core/readJson";
import TerriaError from "../Core/TerriaError";
import proxyCatalogItemUrl from "./proxyCatalogItemUrl";
import loadBlob from "../Core/loadBlob";

class ShapefileCatalogItem extends GeoJsonMixin(
  CatalogMemberMixin(CreateModel(ShapefileCatalogItemTraits))
) {
  static readonly type = "shp";
  get type() {
    return ShapefileCatalogItem.type;
  }

  get typeName() {
    return i18next.t("models.shapefile.name");
  }

  protected async loadFromFile(file: File): Promise<any> {
    return parseShapefile(file);
  }

  protected async loadFromUrl(url: string): Promise<any> {
    if (this.zipFileRegex.test(url)) {
      if (typeof FileReader === "undefined") {
        throw new TerriaError({
          title: i18next.t("models.userData.fileApiNotSupportedTitle"),
          message: i18next.t("models.userData.fileApiNotSupportedTitle", {
            appName: this.terria.appName,
            internetExplorer:
              '<a href="http://www.microsoft.com/ie" target="_blank">' +
              i18next.t("models.userData.internetExplorer") +
              "</a>",
            chrome:
              '<a href="http://www.google.com/chrome" target="_blank">' +
              i18next.t("models.userData.chrome") +
              "</a>",
            firefox:
              '<a href="http://www.mozilla.org/firefox" target="_blank">' +
              i18next.t("models.userData.firefox") +
              "</a>"
          })
        });
      }
      return loadZipFileFromUrl(proxyCatalogItemUrl(this, url));
    }
  }

  protected async customDataLoader(
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ): Promise<any> {}
}

function loadZipFileFromUrl(url: string): Promise<JsonValue> {
  return makeRealPromise<Blob>(loadBlob(url)).then((blob: Blob) => {
    return parseShapefile(blob);
  });
}

async function parseShapefile(blob: Blob) {
  let json: any;
  const asAb = await blob.arrayBuffer();
  json = await shp.parseZip(asAb);
  if (isJsonArray(json)) {
    // There were multiple shapefiles in this zip file. Merge them.
    json = geoJsonMerge.merge(json);
  }
  return json;
}

export default ShapefileCatalogItem;
