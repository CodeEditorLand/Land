class UserActivityRegistry {
    constructor() {
        this.todo = [];
        this.add = (ctor) => {
            this.todo.push(ctor);
        };
    }
    take(userActivityService, instantiation) {
        this.add = ctor => instantiation.createInstance(ctor, userActivityService);
        this.todo.forEach(this.add);
        this.todo = [];
    }
}
export const userActivityRegistry = new UserActivityRegistry();
