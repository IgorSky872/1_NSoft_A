import os
from pathlib import Path

# === НАСТРОЙКИ ===
TARGET_FOLDERS = ["backend", "frontend"]  # Папки для сканирования
OUTPUT_FILE = "project_clean_dump.txt"

# Папки, которые НАДО ПРОПУСТИТЬ
EXCLUDE_FOLDERS = {
    "node_modules", "__pycache__", ".git", ".idea", ".vscode",
    "venv", ".venv", "env", "dist", "build", "alembic"
}

# Расширения файлов, которые НАДО ВКЛЮЧИТЬ
INCLUDE_EXTENSIONS = {".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".md"}


def is_valid_file(file_path: Path) -> bool:
    """Проверяем, нужный ли это файл"""
    # Проверяем расширение
    if file_path.suffix not in INCLUDE_EXTENSIONS:
        return False

    # Проверяем, что путь не содержит запрещенных папок
    for part in file_path.parts:
        if part in EXCLUDE_FOLDERS:
            return False

    return True


def main():
    root = Path(__file__).parent
    files_to_export = []

    print("🔍 Сканирую папки...")

    # Собираем файлы
    for folder_name in TARGET_FOLDERS:
        folder_path = root / folder_name
        if not folder_path.exists():
            print(f"❌ Папка не найдена: {folder_name}")
            continue

        for file_path in folder_path.rglob("*"):
            if file_path.is_file() and is_valid_file(file_path):
                files_to_export.append(file_path)

    print(f"✅ Найдено файлов: {len(files_to_export)}\n")

    # Записываем в файл
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("=== NSoft AI Compiler — Code Dump ===\n\n")

        for idx, file_path in enumerate(files_to_export, 1):
            rel_path = file_path.relative_to(root)
            print(f"[{idx}/{len(files_to_export)}] 📄 {rel_path}")

            f.write(f"{'=' * 60}\nFILE: {rel_path}\n{'=' * 60}\n")
            f.write(file_path.read_text(encoding="utf-8", errors="ignore"))
            f.write("\n\n")

    size_mb = root / OUTPUT_FILE
    print(f"\n🎉 Готово! Файл: {OUTPUT_FILE}")
    print(f"💾 Размер: {size_mb.stat().st_size / 1024:.2f} KB")


if __name__ == "__main__":
    main()