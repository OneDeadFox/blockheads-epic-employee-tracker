INSERT INTO departments (name)
VALUES ("Administrasion"),
        ("Accounting"),
        ("Customer Service"),
        ("Phalange Resources");

INSERT INTO roles (title, salary, department_id)
VALUES ("Owner", 500000, 1),
        ("Accounting Manager", 200000, 2),
        ("CS Manager", 100000, 3),
        ("PR Manager", 150000, 4),
        ("Accountant", 75000, 2),
        ("CR Operator", 40000, 3),
        ("PR Agent", 55000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Blockhead", "Brown", 1, NULL),
        ("Angelhead", "Blue", 2, 1),
        ("Rhombushead", "Brown", 3, 1),
        ("Radiohead", "Green", 4, 1),
        ("Line", "AB", 5, 2),
        ("Line", "BC", 5, 2),
        ("Line", "AC", 5, 2),
        ("Ang", "AB", 6, 3),
        ("Ang", "BC", 6, 3),
        ("Ang", "CD", 6, 3),
        ("Ang", "AD", 6, 3),
        ("Rad", "Sin", 7, 4),
        ("Rad", "Tan", 7, 4);