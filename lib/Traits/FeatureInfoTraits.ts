import ModelTraits from "./ModelTraits";
import objectTrait from "./objectTrait";
import primitiveTrait from "./primitiveTrait";
import anyTrait from "./anyTrait";

class FeatureInfoFormatTraits extends ModelTraits {
  @primitiveTrait({
    type: "number",
    name: "Maximum Fraction Digits",
    description:
      "To reduce the number of decimal places to a maximum of X digits."
  })
  maximumFractionDigits: number = 20;

  @primitiveTrait({
    type: "number",
    name: "Minimum Fraction Digits",
    description:
      "To increase the number of decimal places to a minimum of X digits."
  })
  minimumFractionDigits: number = 0;

  @primitiveTrait({
    type: "boolean",
    name: "Use grouping",
    description: "To show thousands separators"
  })
  useGrouping: boolean = true;
}

export class FeatureInfoTemplateTraits extends ModelTraits {
  @primitiveTrait({
    type: "string",
    name: "Name template",
    description: "A mustache template string for formatting name"
  })
  name?: string;

  @primitiveTrait({
    type: "string",
    name: "Template",
    description: "A Mustache template string for formatting description",
    isNullable: false
  })
  template?: string;

  @anyTrait({
    name: "Partials",
    description:
      "An object, mapping partial names to a template string. Defines the partials used in Template."
  })
  partials?: { [partial_name: string]: string };

  @anyTrait({
    name: "Formats",
    description: "An object, mapping field names to formatting options."
  })
  formats?: { [key_name: string]: FeatureInfoFormatTraits };
}

export default class FeatureInfoTraits extends ModelTraits {
  @objectTrait({
    type: FeatureInfoTemplateTraits,
    name: "Feature info template",
    description:
      "A template object for formatting content in feature info panel"
  })
  featureInfoTemplate?: FeatureInfoTemplateTraits;

  @primitiveTrait({
    type: "string",
    name: "Feature Info Url template",
    description:
      "A template URL string for fetching feature info. Template values of the form {x} will be replaced with corresponding property values from the picked feature."
  })
  featureInfoUrlTemplate?: string;

  @primitiveTrait({
    type: "string",
    name: "Show string if property value is null",
    description:
      "If the value of a property is null or undefined, show the specified string as the value of the property. Otherwise, the property name will not be listed at all."
  })
  showStringIfPropertyValueIsNull?: string;
}
