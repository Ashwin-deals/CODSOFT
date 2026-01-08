FILE_NAME = "tasks.txt"


def load_tasks():
    tasks = []
    try:
        with open(FILE_NAME, "r") as file:
            for line in file:
                task, status = line.strip().split("|")
                tasks.append({"task": task, "done": status == "True"})
    except FileNotFoundError:
        pass
    return tasks


def save_tasks(tasks):
    with open(FILE_NAME, "w") as file:
        for t in tasks:
            file.write(f"{t['task']}|{t['done']}\n")


def show_tasks(tasks):
    if not tasks:
        print("\nNo tasks available.\n")
        return

    print("\nYour Tasks:")
    for i, t in enumerate(tasks, 1):
        status = "✔" if t["done"] else "✘"
        print(f"{i}. {t['task']} [{status}]")
    print()


def add_task(tasks):
    task = input("Enter new task: ")
    tasks.append({"task": task, "done": False})
    save_tasks(tasks)
    print("Task added successfully.\n")


def complete_task(tasks):
    show_tasks(tasks)
    try:
        index = int(input("Enter task number to mark as done: ")) - 1
        tasks[index]["done"] = True
        save_tasks(tasks)
        print("Task marked as completed.\n")
    except (ValueError, IndexError):
        print("Invalid task number.\n")


def delete_task(tasks):
    show_tasks(tasks)
    try:
        index = int(input("Enter task number to delete: ")) - 1
        tasks.pop(index)
        save_tasks(tasks)
        print("Task deleted successfully.\n")
    except (ValueError, IndexError):
        print("Invalid task number.\n")


def main():
    tasks = load_tasks()

    while True:
        print("==== TO-DO LIST ====")
        print("1. View Tasks")
        print("2. Add Task")
        print("3. Complete Task")
        print("4. Delete Task")
        print("5. Exit")

        choice = input("Choose an option (1-5): ")

        if choice == "1":
            show_tasks(tasks)
        elif choice == "2":
            add_task(tasks)
        elif choice == "3":
            complete_task(tasks)
        elif choice == "4":
            delete_task(tasks)
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.\n")


main()
