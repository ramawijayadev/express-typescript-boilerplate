import { ExampleController } from "./example.controller";
import { ExampleRepository } from "./example.repository";
import { ExampleService } from "./example.service";

// Instantiate Repository
const exampleRepository = new ExampleRepository();

// Instantiate Service (injecting Repository)
const exampleService = new ExampleService(exampleRepository);

// Instantiate Controller (injecting Service)
export const exampleController = new ExampleController(exampleService);
