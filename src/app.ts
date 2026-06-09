// App entry point 
import express, { Application, NextFunction, Request, Response } from 'express';
 import cors from 'cors';
import userRoute from './routes/user.route';
import { HttpException } from './exceptions/http_exception';
import { ApiResponseHelper } from './utils/apihelper';
const app: Application = express();
 let corsOptions = {
    orgin: ["*"], // ["http://localhost:3000", "http://example.com"]
    optionsSuccessStatus: 200
 }
 app.use(cors(corsOptions));
app.use(express.json()); // use json as request
app.use(express.urlencoded({ extended: true })); // use form-urlencoded as request
 

app.use("/api/v1/auth", userRoute);
 
 
const data = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 35 },
]
// 5 major api endpoints:
// 1. GET all
app.get(
    "/api/persons",
    (req: Request, res: Response) => {
        // later paginated results
        return res.status(202).json(data);
    }
);
 
// 2. GET by id - Get one
app.get(
    "/api/persons/:id",
    (req: Request, res: Response) => {
        const { id } = req.params; // :id
        const person = data.find(p => p.id === parseInt(id as string));
        return res.status(200).json(person);
    }
);
// 3. POST - Create
app.post(
    "/api/persons",
    (req: Request, res: Response) => {
        const { name, age } = req.body; // client request body
        const newPerson = {
            id: data.length + 1,
            name,
            age
        }
        data.push(newPerson);
        return res.status(201).json(newPerson);
    }
)
// 4. Update (get one and update)
// 4.1 PUT - update whole/most resource
// 4.2 PATCH - update part of resource
app.put(
    "/api/persons/:id",
    (req: Request, res: Response) => {
        const { id } = req.params; // :id
        const { name, age } = req.body; // client request body
        const personIndex = data.findIndex(p => p.id === parseInt(id as string));
 
        const updatedPerson = {
            name,
            age
        }
        data[personIndex] = { ...data[personIndex], ...updatedPerson };
 
        return res.status(200).json(updatedPerson);
    }
)
// 5. DELETE - delete one
app.delete(
    "/api/persons/:id",
    (req: Request, res: Response) => {
        const { id } = req.params; // :id
        const personIndex = data.findIndex(p => p.id === parseInt(id as string));
        data.splice(personIndex, 1);
        return res.status(204).json({ message: "Person deleted" });
    }
)
 
app.get(
    '/hello',
    (req: Request, res: Response) => {
        return res.send('Hello, World!');
    }
);
 
app.get(
    '/hello/:name',
    (req: Request, res: Response) => {
        // const name = req.params.name;
        const { name } = req.params; // :name
        const { title } = req.query; // ?title=Dr.
        return res.send(`Hello, ${title} ${name}!`);
    }
);
 
// task
app.get(
    '/hello/:name/:age',
    (req: Request, res: Response) => {
        // const name = req.params.name;
        const { name, age } = req.params; // :name
        const { title, category } = req.query; // ?title=Dr.&category=doctor
        // return "Hello Dr. John, you are 30 years old and your category is doctor."
        return res.send(`Hello ${title} ${name},
            you are ${age} years old and your category is ${category}.`);
    }
);
 
// localhost:8088/hello/John/21?title=Dr.&category=doctor
 
// global handler if no route match, return 404
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "Route not found" });
    }
);
 
// global error handler
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        if(err instanceof HttpException){
            return ApiResponseHelper.error(
                res, 
                err.message,
                err.status

            );
        }
        return ApiResponseHelper.error(
            res,
            err?.message || "Internal Server Error",
            500  
        );

        //return res.status(500).json(
        // {message: err.message ?? " Internal Server Error"}
        // );
    }
);
 
const PORT: number = 8088;
const dummy: string = "Dummy"
export {
    PORT,
    dummy
}
 
export default app;
 
// app.listen(
//     PORT,
//     () => {
//         console.log(`Server running: ${PORT}`);
//     }
// );
// execute script: npx tsx --watch app.ts
// http://localhost:8088/