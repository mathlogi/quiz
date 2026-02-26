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
    }
];
