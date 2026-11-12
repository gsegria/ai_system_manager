#!/usr/bin/env python3

import configparser
import getpass
import secrets
import os
from pathlib import Path

from security.credential_manager import CredentialManager


CONFIG_PATH = Path(__file__).resolve().parent.parent / "web_settings.ini"


def main():
    if CONFIG_PATH.exists():
        print("[ERROR] web_settings.ini already exists.")
        print("Existing configuration will not be overwritten.")
        return 1

    username = input("Admin username [admin]: ").strip() or "admin"

    while True:
        password = getpass.getpass("Admin password (4-20 characters): ")

        if not CredentialManager.validate_password(password):
            print("[ERROR] Password must be 4-20 characters.")
            continue

        confirm = getpass.getpass("Confirm password: ")

        if password != confirm:
            print("[ERROR] Passwords do not match.")
            continue

        break

    config = configparser.ConfigParser()

    config["WEB"] = {
        "host": "0.0.0.0",
        "port": "8081",
        "secret_key": secrets.token_urlsafe(32),
    }

    config["AUTH"] = {
        "username": username,
        "password_hash": CredentialManager.create_hash(password),
        "max_login_attempts": "5",
        "lockout_seconds": "300",
        "session_timeout": "1800",
    }

    with CONFIG_PATH.open("w", encoding="utf-8") as file:
        config.write(file)

    os.chmod(CONFIG_PATH, 0o600)

    print("[OK] Configuration created.")
    print(f"[OK] Path: {CONFIG_PATH}")
    print("[OK] Password stored as scrypt hash.")
    print("[OK] File permission: 600")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
