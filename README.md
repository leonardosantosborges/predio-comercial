# Guia do Prédio Comercial

Projeto estático para consulta pública por QR code e gerenciamento privado dos 29 andares de um prédio comercial.

## Como usar

Rode o servidor local:

```bash
npm start
```

Depois acesse:

```text
http://127.0.0.1:4173
```

Para gerar o pacote estático usado pela Vercel:

```bash
npm run build
```

Isso cria a pasta `dist/`.

A tela pública não mostra botão de gerenciamento. Para acessar o painel privado, abra diretamente:

```text
http://127.0.0.1:4173/admin.html
```

Senha demonstrativa:

```text
admin123
```

## Funcionalidades

- Desenho lateral do prédio com os 29 andares clicáveis.
- Mais de um local por andar, incluindo múltiplas cafeterias, lojas ou serviços.
- Busca por nome, tipo, descrição ou andar.
- Filtros por tipo e visibilidade.
- Ocupantes privados aparecem apenas como ocupados, sem nome e sem descrição pública.
- Painel privado para adicionar, editar e excluir itens de cada andar.
- Dados salvos no navegador com `localStorage`.

## Uso com QR code

Hospede esta pasta em qualquer serviço estático e gere um QR code apontando para a URL pública.

Exemplo:

```text
https://seu-dominio.com/predio-comercial/
```

## Rotas

- `/` tela pública para visitantes.
- `/index.html` mesma tela pública, caso o host não use clean URLs.
- `/admin` painel privado, configurado no `vercel.json`.
- `/admin.html` painel privado direto.
- `/styles.css`, `/data.js`, `/app.js` e `/admin.js` arquivos estáticos usados pelas telas.

## Vercel

Configuração recomendada:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: vazio ou padrão do Vercel

O arquivo `vercel.json` já define `buildCommand`, `outputDirectory`, URL limpa e reescreve `/admin` para `/admin.html`.

## Observação de segurança

Este é um protótipo funcional sem backend. A senha do painel fica no arquivo `admin.js`, então não deve ser usada como segurança real em produção. Para uso definitivo, o ideal é adicionar backend com login, banco de dados e armazenamento seguro de imagens.
