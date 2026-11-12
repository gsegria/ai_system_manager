from web_manager.app import create_app
from config.settings_manager import SettingsManager


def main():
    settings = SettingsManager().load()
    app = create_app()

    host = settings.web["host"]
    port = settings.web["port"]

    print("=" * 45)
    print("AI Platform Manager")
    print(f"Web Server: http://{host}:{port}")
    print("=" * 45)

    app.run(
        host=host,
        port=port,
        debug=False,
        threaded=True,
    )


if __name__ == "__main__":
    main()
