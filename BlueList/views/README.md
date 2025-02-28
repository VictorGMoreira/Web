# Especificações

Modelo básico:
---

O layout do BlueList foi definido para ter duas colunas fluídas. Na parte principal do site, as colunas são organizadas com o uso de um design responsivo, com base no framework TailWind.

### Página Principal: 
O design é baseado em duas colunas fluídas, o que significa que as colunas podem se ajustar automaticamente ao tamanho da tela, com o conteúdo se adaptando a diferentes resoluções (por exemplo, a visualização em dispositivos móveis ou desktop).

### Início, Filmes e Séries:  
O design de cada uma dessas páginas segue a mesma lógica de duas colunas.

 Paleta de cores:
---

- Cor Principal (azul): #0000FF
Utilizada para botões, links e outras interações principais no design.
- Cor de fundo: #000000 (preto)
Para manter o foco no conteúdo, especialmente os filmes e séries, criando um contraste com as cores mais vibrantes.
- Texto Claro: #FFFFFF (branco)
Para a maioria dos textos, garantindo boa legibilidade contra o fundo preto.
- Cinza Claro: #D1D5DB (usado em texto secundário)
Para textos informativos ou menos importantes como descrições e detalhes menores
- Cor de fundo usado no header e footer: #222
- Cor de alguns botões: #2196F3

Fontes:
--- 
- Fonte Principal: Helvetica\
Uma fonte limpa, moderna e de fácil leitura. Usada para os títulos, descrições e texto principal.\
Fontes Secundárias: As fontes padrão do navegador, caso a Helvetica não esteja disponível.

Rotas:
---

- /
  - Rota principal (Home)
    - Exibe filmes populares

- /filmes
  - Exibe filmes populares
  - Cada filme pode ter seu trailer exibido

- /detalhesFilme/:id
  - Exibe detalhes do filme com base no ID
  - Exibe informações como título, duração, avaliação, trailer e sinopse

- /series
  - Exibe séries populares
  - Cada série pode ter seu trailer exibido

- /detalhesSerie/:id
  - Exibe detalhes da série com base no ID
  - Exibe informações como título, gênero, temporada, episódio, trailer e sinopse

- /pesquisa
  - Permite pesquisa de filmes por termo
  - Exibe resultados da pesquisa

- /minhaLista
  - Exibe filmes e séries salvos pelo usuário
  - Arquivos de filmes e séries salvos são lidos de arquivos JSON

- /salvarSerie
  - Salva uma série na "Minha Lista" do usuário

- /salvarFilme
  - Salva um filme na "Minha Lista" do usuário

- /removerSerie
  - Remove uma série da "Minha Lista" do usuário

- /removerFilme
  - Remove um filme da "Minha Lista" do usuário
