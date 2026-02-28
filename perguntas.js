const database = [
    {
        id: "mat_01",
        title: "Matemática 9º Ano - Preparação",
        questions: [
            { 
                type: "multiple", 
                q: "Qual a área de um triângulo com base 10 e altura 8?", 
                img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Triangle.Area.svg/220px-Triangle.Area.svg.png", 
                opts: ["80", "40", "20", "18"], 
                ans: 1 
            },
            { 
                type: "short", 
                q: "Como se chama o polígono de 5 lados?", 
                img: "", 
                ans: "pentágono" 
            }
        ]
    },
    {
        id: "mat_02",
        title: "Matemática 10º Ano - Preparação",
        questions: [
            { 
                type: "multiple", 
                q: "Qual a área de um triângulo com base 10 e altura 8?", 
                img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Triangle.Area.svg/220px-Triangle.Area.svg.png", 
                opts: ["80", "40", "20", "18"], 
                ans: 1 
            },
            { 
                type: "short", 
                q: "Como se chama o polígono de 5 lados?", 
                img: "", 
                ans: "pentágono" 
            }
        ]
    },
    
    {
        "id": "mat8_001",
        "title": "Monómios e Polinómios",
        "questions": [
            {
                "type": "multiple",
                "q": "Qual é o grau do monómio que representa a área de um quadrado de lado $x$?",
                "img": "",
                "opts": ["$6$", "$5$", "$4$", "$2$"],
                "ans": 3
            },
            {
                "type": "multiple",
                "q": "Qual é o grau do polinómio: $-2x^2 + 3x^2 - 2x^2 + x + 1 - x - 3x^3$?",
                "img": "",
                "opts": ["$0$", "$1$", "$2$", "$3$"],
                "ans": 3
            },
            {
                "type": "multiple",
                "q": "Indica a simplificação de: $-3x + 2y - 1 + x + \\frac{y}{2}$",
                "img": "",
                "opts": ["$-2x + \\frac{5}{2}y - 1$", "$-2x + \\frac{3}{2}y - 1$", "$-4x + \\frac{5}{2}y - 1$", "$-2x + 5y$"],
                "ans": 0
            },
            {
                "type": "multiple",
                "q": "Qual destas expressões NÃO é um monómio nem um polinómio?",
                "img": "",
                "opts": ["$xy \\cdot 3$", "$2x + \\frac{1}{2}$", "$3x + \\frac{1}{x}$", "$\\frac{1}{4}x$"],
                "ans": 2
            },
            {
                "type": "multiple",
                "q": "Indica o polinómio reduzido de: $x - \\frac{x-1}{3} + 2(x^2 + 1)$?",
                "img": "",
                "opts": ["$2x^2 + \\frac{2}{3}x + \\frac{7}{3}$", "$2x^2 + \\frac{2}{3}x + \\frac{5}{3}$", "$2x^2 + 2x + 3$", "$6x^2 + 2x + 7$"],
                "ans": 0
            },
            {
                "type": "multiple",
                "q": "Qual o perímetro de um retângulo de lados $x$ e $y$?",
                "img": "",
                "opts": ["$x + y$", "$2x + 2y$", "$xy$", "$2x + y$"],
                "ans": 1
            },
            {
                "type": "multiple",
                "q": "Valor numérico de $\\frac{1}{2}xy + 2$ para $x = -1$ e $y = \\frac{2}{3}$?",
                "img": "",
                "opts": ["$-\\frac{5}{3}$", "$\\frac{5}{3}$", "$-\\frac{2}{3}$", "$\\frac{2}{3}$"],
                "ans": 1
            },
            {
                "type": "multiple",
                "q": "Expressão equivalente a $(x - 2)(4 + 3x)$?",
                "img": "",
                "opts": ["$3x^2 - (2x - 8)$", "$-8x^2 - 6 + 11x^2 - 2 + 2x$", "$2x - (-3x^2 + 8)$", "$3x^2 - 2x - 8$"],
                "ans": 3
            },
            {
                "type": "multiple",
                "q": "Identifica o coeficiente do monómio $8x^2$:",
                "img": "",
                "opts": ["$x$", "$2$", "$8$", "$x^2$"],
                "ans": 2
            },
            {
                "type": "multiple",
                "q": "Polinómio reduzido de $(x - 1)^2$:",
                "img": "",
                "opts": ["$x^2 - 1$", "$x^2 - 2x + 1$", "$x^2 + 1$", "$x^2 + 2x + 1$"],
                "ans": 1
            },
            {
                "type": "multiple",
                "q": "Dois monómios dizem-se simétricos se:",
                "img": "",
                "opts": ["Têm a mesma parte literal", "Têm coeficientes simétricos e mesma parte literal", "Têm o mesmo coeficiente", "Têm graus diferentes"],
                "ans": 1
            },
            {
                "type": "multiple",
                "q": "O monómio $3xy$ e $-\\frac{2}{3}xy$ são:",
                "img": "",
                "opts": ["Simétricos", "Semelhantes", "Constantes", "Nulos"],
                "ans": 1
            },
            {
                "type": "multiple",
                "q": "Área de um retângulo de base $(x+2)$ e altura $(x+3)$?",
                "img": "",
                "opts": ["$x^2 + 5x + 6$", "$2x + 5$", "$x^2 + 6$", "$x^2 + 5$"],
                "ans": 0
            },
            {
                "type": "multiple",
                "q": "Qual o grau do monómio $3x^2y^3$?",
                "img": "",
                "opts": ["$2$", "$3$", "$5$", "$6$"],
                "ans": 2
            },
            {
                "type": "multiple",
                "q": "Forma reduzida de $(2 + 3x)(x - 1)$?",
                "img": "",
                "opts": ["$3x^2 - x - 2$", "$3x^2 + x - 2$", "$3x^2 - 2$", "$5x - 2$"],
                "ans": 0
            },
            {
                "type": "short",
                "q": "Escreve na forma reduzida: $2x \\cdot y^2 \\cdot \\frac{2x}{3}$",
                "img": "",
                "ans": "\\frac{4}{3}x^2y^2"
            },
            {
                "type": "short",
                "q": "Grau do polinómio reduzido: $5x^3 + 3x^2 + 7y - 8x^2 + 12y - 5x^3$",
                "img": "",
                "ans": "2"
            },
            {
                "type": "short",
                "q": "Simplifica: $2a + 3ab - a + \\frac{1}{2}a - \\frac{ab}{5}$",
                "img": "",
                "ans": "\\frac{3}{2}a+\\frac{14}{5}ab"
            },
            {
                "type": "short",
                "q": "Polinómio reduzido de $3x(x - 1)$:",
                "img": "",
                "ans": "3x^2-3x"
            },
            {
                "type": "short",
                "q": "Calcula o produto: $(x + 1)(2x + 3)$",
                "img": "",
                "ans": "2x^2+5x+3"
            },
            {
                "type": "short",
                "q": "Reduz os termos: $\\frac{1}{2}x + \\frac{2}{3}y + \\frac{1}{2}x + \\frac{3}{10}y + \\frac{1}{2}$",
                "img": "",
                "ans": "x+\\frac{29}{30}y+\\frac{1}{2}"
            },
            {
                "type": "short",
                "q": "Parte literal do monómio $-2ax^3y$?",
                "img": "",
                "ans": "x^3y"
            },
            {
                "type": "short",
                "q": "Simplifica: $2x + 3y - 3x + y$",
                "img": "",
                "ans": "-x+4y"
            },
            {
                "type": "short",
                "q": "Escreve na forma reduzida: $(3x + 1)^2 - x^2$",
                "img": "",
                "ans": "8x^2+6x+1"
            },
            {
                "type": "short",
                "q": "Qual é o grau de um monómio constante não nulo?",
                "img": "",
                "ans": "0"
            },
            {
                "type": "short",
                "q": "Multiplica: $\\frac{1}{2}x \\cdot \\frac{2}{3}y^2 \\cdot 3x$",
                "img": "",
                "ans": "x^2y^2"
            },
            {
                "type": "short",
                "q": "Indica o coeficiente de $\\frac{x}{2}$:",
                "img": "",
                "ans": "\\frac{1}{2}"
            },
            {
                "type": "short",
                "q": "Forma reduzida: $-2(x - \\frac{1}{2}) + 2y - (1 - y)$",
                "img": "",
                "ans": "-2x+3y"
            },
            {
                "type": "short",
                "q": "Simplifica a expressão: $(2x - 3)(x - 1)$",
                "img": "",
                "ans": "2x^2-5x+3"
            },
            {
                "type": "short",
                "q": "Qual é o coeficiente do monómio $-x$?",
                "img": "",
                "ans": "-1"
            }
        ]
    }

];
