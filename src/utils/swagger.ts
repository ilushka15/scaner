import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Aanwezigheidssysteem API",
      version: "1.0.0",
      description: "Eenvoudige REST API voor studenten, groepen en aanwezigheid."
    },
    servers: [{ url: "http://localhost:3001" }]
    ,
    paths: {
      "/api/v1/attendance/state": {
        get: { summary: "Haal studenten, groepen en aanwezigheid op", responses: { "200": { description: "Huidige aanwezigheid" } } }
      },
      "/api/v1/attendance/scan": {
        post: { summary: "Check een student in", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["code"], properties: { code: { type: "string", example: "252272" } } } } } }, responses: { "200": { description: "Scanresultaat" }, "400": { description: "Ongeldige code" } } }
      },
      "/api/v1/attendance/students": {
        get: { summary: "Haal alle studenten op", responses: { "200": { description: "Studentenlijst" } } },
        post: { summary: "Maak een student aan", responses: { "201": { description: "Student aangemaakt" }, "409": { description: "Studentnummer bestaat al" } } }
      },
      "/api/v1/attendance/groups": {
        get: { summary: "Haal alle groepen op", responses: { "200": { description: "Groepenlijst" } } },
        post: { summary: "Maak een groep aan", responses: { "201": { description: "Groep aangemaakt" } } }
      }
    }
  },
  apis: ["./src/modules/**/*.ts"]
});
