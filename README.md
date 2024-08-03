# PDI_AP1

Desenvolver um programa processador de imagens com interface gráfica. O programa deve:

1. Abrir e Salvar arquivos de imagens, pelo menos, nos formatos bmp e jpg. É permitido utilizar biblioteca de terceiros para isso;
2. Aplicar processamentos nas imagens de acordo com as técnicas vistas em sala de aula;
3. A cada aula será divulgado um novo conjunto de algoritmos/métodos que devem ser implementados e adicionados ao programa desenvolvido;
4. Exceto quando avisado, não é permitido utilizar biblioteca que possua funções de processamento de imagens. Todos os algoritmos devem ser escritos pela equipe, manipulando diretamente a matriz que representa a imagem. Bibliotecas de Álgebra Linear são permitidas, porém com a restrição de não utilizar uma função que seja ela própria requisito do trabalho (sempre que for o caso, será avisado);
5. O programa deve possuir uma inteface gráfica amigável que permita a um usuário leigo editar imagens salvas em seu computador. Para isso, é permitido usar biblioteca/framework que facilite a construção da interface;


**Lista de Requisitos:**

[Parte 1]:

- Negativo ✅
- Transformações logarítmicas ✅
- Potência (correção de gama) linear definidas por partes ✅ (questoes gráficas incompletas)
- Esteganografia ✅

[Parte 2]:

- Exibição do histograma ✅
- Equalização de histograma ❌

[Parte 3]:

- Limiarização (Binarização) ✅
- Aplicação de filtro genérico por convolução ❌
- Filtro de suavização da média ✅
- Filtro gaussiano ❌

[Parte 4]:

- Aguçamento (nitidez) por Laplaciano ✅
- High-Boost ✅


[Parte 5]:

- Filtros de Sobel – x e y separados ✅
- Detecção não linear de bordas pelo gradiente (magnitude) ✅

[Parte 6]:

- Escala (vizinho mais próximo) ✅
- Escala (interpolação linear) ✅
- Rotação (vizinho mais próximo) ✅
- Rotação (interpolação linear) ✅

[parte 7]:

- Cálculo da Transformada Discreta de Fourier, exibição do espectro (deslocado) com possibilidade de edição por parte do usuário (ferramenta de desenho que permita riscar com pontos pretos e brancos a imagem do espectro ou pontos em escala de cinza - “pincel suave”) e cálculo da transformada inversa (dadas as modificações editadas pelo usuário no espectro), obtendo a imagem filtrada. ❌

[parte 8]:
1. **Criação da Ferramenta de Transformação de Cores** ✅
   - RGB <-> HSV

2. **Algoritmos de Escala de Cinza** ✅
   - Média Aritmética Simples 
   - Média Ponderada

3. **Algoritmo de Negativo**
   - Implementação do efeito negativo em imagens ❌
[parte 9]:
1. **Chroma-Key** ✅
   - Implementar a seleção da 'distância' da cor verde
   - Implementar a substituição da imagem com base na cor verde

2. **Histograma** ❌
   - Implementar histogramas para canais R, G, B e I

3. **Equalização de Histograma em Imagens Coloridas** ❌
   - Trabalhar com o espaço de cor HSI

4. **Ajuste de Matiz, Saturação e Brilho** ✅
   - Controle de intensidade HSI

5. **Ajuste de Canal** ❌
   - Ajustar C/R, M/G e Y/B

6. **Sépia** ✅
   - Implementar o efeito sépia (“escala de cinza amarelada”)  
