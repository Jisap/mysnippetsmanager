import type { Monaco } from '@monaco-editor/react'

export function configureMonaco(monaco: Monaco) {
  // Desactivar validaciones semánticas y de tipos (como "Cannot find module 'react'" o tipos no encontrados)
  monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
  })

  monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
  })

  // Habilitar soporte JSX de React para que reconozca sintaxis TSX/JSX sin advertencias
  monaco.languages.typescript?.typescriptDefaults?.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTextFiles: true,
    allowJs: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
  })

  monaco.languages.typescript?.javascriptDefaults?.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTextFiles: true,
    allowJs: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
  })
}
