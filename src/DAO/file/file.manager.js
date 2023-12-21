import fs from 'fs'
import { error } from "console";

class FileManager {

    constructor(filename = './db.json') {
        this.filename = filename
        this.getObjects();
    }

    getNextId = (list) => {
        return (list.length == 0) ? 1 : list[list.length - 1].id + 1
    }

    getObjects = async () => {
        try {
            const data = await fs.promises.readFile(this.filename, "utf-8");
            return JSON.parse(data);
          } catch (error) {
            console.log("Error, no se encontró el archivo");
            return []
          }
    }

    getObjectsById = async (objectID) => {
        const objectsAll = await this.getObjects();
        const object = objectsAll.find(
          (object) => object.id === parseInt(objectID)
        );
    
        if (!object) {
          throw new Error("No se encuentra.");
        }
    
        return object;
      };

    set = async (data) => {
        const list = await this.get()
        data.id = this.getNextId(list)
        list.push(data)
        return fs.promises.writeFile(this.filename, JSON.stringify(list))
    }

    updateObject = async (objectId, updatedFields) => {
        try {
          const objectsAll = await this.getObjects();
          const objectIndex = objectsAll.findIndex(
            (object) => object.id === parseInt(objectId)
          );
    
          if (objectIndex !== -1) {
            const updatedObject = {
              ...objectsAll[objectIndex],
              ...updatedFields,
            };
    
            objectsAll[objectIndex] = updatedObject;
            await this.writeObjects(objectsAll);
    
            return updatedObject;
          }
        } catch (error) {
          console.error("Error al actualizar el objecto:", error);
        }
      };
    
      deleteObjets = async (objectId) => {
        try {
          const objectsAll = await this.getObjects();
          const objectIndex = objectsAll.findIndex(
            (object) => object.id === parseInt(objectId)
          );
    
          if (objectIndex !== -1) {
           const eliminado = objectsAll.splice(objectIndex, 1);
            await this.writeObjects(objectsAll);
    
            return eliminado; 
          } else{
            console.log("no se pudo eliminar")
          }
          }
         catch (error) {
          return console.error("Error al eliminar el objeto:", error);
        }
      };

    generarCode(index) {
        const CODE = "CODE" + (index + 1);
        return CODE;
      }
      writeObjects = async (objects) => {
        try {
          await fs.promises.writeFile(this.filename, JSON.stringify(objects));
        } catch (error) {
          console.error("Error al escribir los archivos:", error);
        }
      };  

}

export default FileManager