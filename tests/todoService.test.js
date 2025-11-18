import { expect } from 'chai';
import sinon from 'sinon';
import { todoService } from '../src/services/todoService.js';
import { TodoModel } from '../src/models/todoModel.js';

describe('Todo Service Layer', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return all todos', async () => {
    const mockTodos = [
      { id: 1, title: 'Test 1' },
      { id: 2, title: 'Test 2' },
    ];
    sandbox.stub(TodoModel, 'getAll').returns(mockTodos);

    const result = await todoService.getAll();

    expect(result).to.deep.equal(mockTodos);
    expect(TodoModel.getAll.calledOnce).to.be.true;
  });

  it('should create a new todo', async () => {
    const todoData = { title: 'New Todo' };
    const fakeTodo = { id: 1, title: 'New Todo', completed: 0 };

    sandbox.stub(TodoModel, 'create').returns(fakeTodo);

    const result = await todoService.create(todoData);

    expect(result).to.deep.equal(fakeTodo);
    expect(TodoModel.create.calledOnceWith(todoData)).to.be.true;
  });

  it('should update a todo', async () => {
    const updated = { id: 1, title: 'Updated Todo' };
    sandbox.stub(TodoModel, 'update').returns(updated);

    const result = await todoService.update(1, { title: 'Updated Todo' });

    expect(result).to.deep.equal(updated);
    expect(TodoModel.update.calledOnceWith(1, { title: 'Updated Todo' })).to.be.true;
  });

  it('should delete a todo', async () => {
    sandbox.stub(TodoModel, 'delete').returns(true);

    const result = await todoService.delete(1);
    expect(result).to.be.true;
    expect(TodoModel.delete.calledOnceWith(1)).to.be.true;
  });
});
