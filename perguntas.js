const database = [
    {
        id: "mat_01",
        title: "Matemática Interativa",
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
        id: "mat_12_complexos",
        title: "Matemática 12º Ano - Complexos",
        questions: [
            {
                type: "multiple",
                q: "Qual é a forma algébrica do número complexo $z = 2e^{i\frac{\pi}{3}}$?",
                img: "",
                opts: ["$1 + i\sqrt{3}$", "$\sqrt{3} + i$", "$1 - i\sqrt{3}$", "$2 + 2i$"],
                ans: 0
            },
            {
                type: "short",
                q: "Calcula o valor da derivada de $f(x) = x^2$ no ponto $x=3$.",
                img: "",
                ans: "6"
            },
            {
                type: "multiple",
                q: "Qual o valor do limite $\lim_{n \to \infty} (1 + \frac{1}{n})^n$?",
                img: "",
                opts: ["0", "1", "$e$", "$\infty$"],
                ans: 2
            }
        ]
    },
    {
        id: "mat_geometria",
        title: "Matemática - Geometria",
        questions: [
            { 
                type: "multiple", 
                q: "Qual a área de um quadrado com lado 5m?", 
                img: "", 
                opts: ["10m²", "20m²", "25m²", "50m²"], 
                ans: 2 
            },
            { 
                type: "short", 
                q: "Como se chama o polígono de 3 lados?", 
                img: "", 
                ans: "triângulo" 
            }
        ]
    },
    {
        id: "eng_estruturas",
        title: "Engenharia - Estruturas",
        questions: [
            { 
                type: "multiple", 
                q: "Qual o momento máximo nesta viga biapoiada com carga P ao centro?", 
                img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bending_moment_diagram.png/300px-Bending_moment_diagram.png", 
                opts: ["PL/2", "PL/4", "PL/8", "ql²/8"], 
                ans: 1 
            }
        ]
    }
];
