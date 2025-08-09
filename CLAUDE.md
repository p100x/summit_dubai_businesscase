# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack on port 3000
- `npm run build` - Build production application  
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture

This is a Next.js 15 application with TypeScript for an event financial dashboard. The application uses a model-driven architecture where financial data is defined in YAML and evaluated dynamically.

### Core Components

**State Management**: Zustand store (`src/store/modelStore.ts`) manages the application state including:
- YAML model parsing and validation
- Model evaluation through the engine
- Currency switching (EUR/AED)
- Error handling for invalid YAML input

**Model System**: Financial calculations are driven by a schema-based model (`src/lib/model/`):
- `schema.ts`: Zod schemas defining revenue/cost structures with formula support
- `engine.ts`: Evaluates models using expr-eval for formula calculations, outputs results in AED
- `yaml.ts`: Handles YAML serialization/deserialization
- Models support both direct amounts and formula-based calculations

**UI Components** (`src/components/`):
- `ModelEditor.tsx`: YAML editor with CodeMirror integration
- `Charts.tsx`: Data visualization using Recharts
- `Tables.tsx`: Financial data tables
- `KpiCard.tsx`: Key performance indicators display
- `CurrencySwitcher.tsx`: Toggle between EUR and AED display

### Key Technical Details

- All financial calculations are performed in AED internally
- EUR conversion uses the `eur_to_aed` assumption from the model
- Formula evaluation uses expr-eval parser with access to model context
- Tailwind CSS v4 with PostCSS for styling
- TypeScript strict mode enabled with path alias `@/*` for src directory