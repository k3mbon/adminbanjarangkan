import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import { schemas } from './src/sanitySchemas.js'

export default defineConfig({
  name: 'default',
  title: 'Admin Banjarangkan',
  projectId: 'e0jvxihm',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemas,
  },
})