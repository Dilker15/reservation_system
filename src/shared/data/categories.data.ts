

import { Category } from "../entities/category.entity";

const categories: Partial<Category>[] = [
  {
    name: 'Coworking',
    description: 'Shared spaces for working comfortably and flexibly',
  },
  {
    name: 'Sports Court',
    description: 'Sports courts available for rent by the hour or for events',
  },
  {
    name: 'Event Hall',
    description: 'Halls for meetings, parties, or corporate events',
  },
  {
    name: 'Resort',
    description: 'Recreational areas with access to pool, river, or beach',
  },
  {
    name: 'Training Room',
    description: 'Spaces equipped for courses, workshops, or seminars',
  },
]

export default categories;
