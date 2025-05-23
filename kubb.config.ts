import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginZod } from "@kubb/plugin-zod";

export default defineConfig({
  root: ".",
  input: {
    // path: "https://api-asu.zeyadhekal.tech/api-json",
    path: "http://localhost:3001/api-json",
  },
  output: {
    path: "./src/generated",
    clean: true,
  },
  plugins: [
    pluginOas({
      output: {
        path: "./json",
      },
      serverIndex: 0,
      contentType: "application/json",
    }),
    pluginTs({
      output: {
        path: "./types",
      },
      exclude: [
        {
          type: "tag",
          pattern: "store",
        },
      ],
      group: {
        type: "tag",
        name: ({ group }) => `${group}Controller`,
      },
      enumType: "asConst",
      enumSuffix: "Enum",
      dateType: "date",
      unknownType: "unknown",
      optionalType: "questionTokenAndUndefined",
      oasType: "infer",
    }),
    pluginReactQuery({
      output: {
        path: "./hooks",
      },
      group: {
        type: "tag",
        name: ({ group }) => `${group}Hooks`,
      },
      client: {
        importPath: "../../../global/api/apiClient",
        dataReturnType: "full",
      },
      mutation: {
        methods: ["post", "put", "delete", "patch"],
      },
      infinite: {
        queryParam: "limit",
        initialPageParam: 0,
        cursorParam: "page",
      },
      query: {
        methods: ["get"],
        importPath: "@tanstack/react-query",
      },
      suspense: {},
    }),
    pluginZod({
      output: {
        path: "./zod",
      },
      group: { type: "tag", name: ({ group }) => `${group}Schemas` },
      dateType: "stringOffset",
      unknownType: "unknown",
      importPath: "zod",
      inferred: true,
    }),
  ],
});
