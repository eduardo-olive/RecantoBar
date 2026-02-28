// prisma.config.ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Tente com três barras para garantir que o Windows entenda como caminho de arquivo
    url: 'file:.///planalto.db', 
  },
});