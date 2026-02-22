

import { Category } from "src/categories/entities/category.entity";



const categories: Partial<Category>[] = [
  {
    name: 'Cabaña',
    description: 'Espacios acogedores en la naturaleza, ideales para descansar y desconectarse del día a día',
  },
  {
    name: 'Casa de Campo',
    description: 'Casas amplias en entornos rurales, perfectas para familias o grupos que buscan tranquilidad',
  },
  {
    name: 'Chalet',
    description: 'Alojamientos de estilo montañés con ambientes cálidos y vistas espectaculares',
  },
  {
    name: 'Domo',
    description: 'Estructuras geodésicas únicas que ofrecen una experiencia de camping con todo el confort',
  },
  {
    name: 'Tiny House',
    description: 'Casas pequeñas y funcionales diseñadas para una experiencia minimalista y sostenible',
  },
  {
    name: 'Casa en Árbol',
    description: 'Alojamientos elevados entre los árboles para una experiencia mágica e inigualable',
  },
  {
    name: 'Estancia',
    description: 'Grandes propiedades rurales con actividades al aire libre, ideal para grupos y familias',
  },
]

export default categories;
