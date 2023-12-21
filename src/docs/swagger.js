import swaggerJsdoc from "swagger-jsdoc";
import __dirname from "../utils.js";


export const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documentación Proyecto Final curso Backend Ecommerce 2023 2023 ",
            description:  `Documentación de la API del proyecto final.\n
            Esta documentación tiene como finalidad poder consumir la api generada en mi servidor.\n
            El proyecto ha sido realizado con EXPRESS JS, NODE JS, JAVASCRIPT, MONGO DB, HANDLEBARS.\n
            El proyecto se trata en realizar el backend de una ecommerce completa.\n
            Información adicional sobre el proyecto:\n
              * API para el manejo de productos (con websockets)
              * API para el manejo de categorías
              * API para el manejo de la autenticación y autorización
              * API para el carrito de compras
              * API para los tickets de una compra
              * Reestablecimiento de la contraseña
              * Verificación del correo del usuario a través de un mail.
              * Interfaz gráfica utilizando el motor de plantillas handlebars.
              * Estilos proporcionados con CSS y Boostrap.\n
             Datos del cursado:\n
              * Año: 2023
              * Comisión: 52135
              * Del 20-05-2023 al 11-11-2023
              * Profesor: Arturo Verbel de Leon
              * Tutor: Marco Giabbani\n
              Repositorio de github del proyecto: https://github.com/GermanIaniero/Proyecto-Final-Coder-Backend \n
              Información de contacto: \n
              * Email: german_danielianiero@hotmail.com
              * Linkedin: https://www.linkedin.com/in/german-ianierook/
              * Github: https://github.com/GermanIaniero'
              `,
        } 
    }, 

    components: {
        securitySchemes: {
          Authorization: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            value: "Bearer <JWT token here>",
          },
        },
      },

          
    apis: [`${__dirname}/../docs/**/*.yaml`]
}

export const specs = swaggerJsdoc(swaggerOptions);