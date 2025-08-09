import YAML from "yaml";
import { Model, ModelSchema } from "./schema";

export function parseModelFromYaml(yamlText: string): Model {
  const data = YAML.parse(yamlText) ?? {};
  const result = ModelSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid model YAML: ${issues}`);
  }
  return result.data;
}

export function stringifyModelToYaml(model: Model): string {
  return YAML.stringify(model);
}

