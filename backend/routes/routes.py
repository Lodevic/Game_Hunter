from backend.controllers.auth_controller import (
    login_required,
    api_me, api_login, api_register, api_logout,
    api_profile, api_profile_me, api_profile_update,
)
from backend.controllers.dashboard_controller import api_dashboard
from backend.controllers.game_controller import (
    api_bg_images, api_popular_games,
    api_rekomendasi, api_search, api_tags, api_recommend,
    api_favorit, api_favorit_list, api_favorit_toggle,
)


def register_routes(app):
    # ── Auth ──────────────────────────────────────────
    app.add_url_rule('/api/me',                   view_func=api_me)
    app.add_url_rule('/api/login',                view_func=api_login,           methods=['POST'])
    app.add_url_rule('/api/register',             view_func=api_register,        methods=['POST'])
    app.add_url_rule('/api/logout',               view_func=api_logout,          methods=['POST'])

    # ── Profile ───────────────────────────────────────
    app.add_url_rule('/api/profile',              view_func=login_required(api_profile))
    app.add_url_rule('/api/profile/me',           view_func=login_required(api_profile_me))
    app.add_url_rule('/api/profile/update',       view_func=login_required(api_profile_update), methods=['POST'])

    # ── Dashboard ─────────────────────────────────────
    app.add_url_rule('/api/dashboard',            view_func=login_required(api_dashboard))

    # ── Games (publik) ────────────────────────────────
    app.add_url_rule('/api/bg-images',            view_func=api_bg_images)
    app.add_url_rule('/api/popular-games',        view_func=api_popular_games)
    app.add_url_rule('/api/tags',                 view_func=api_tags)

    # ── Games (private) ───────────────────────────────
    app.add_url_rule('/api/rekomendasi',          view_func=login_required(api_rekomendasi))
    app.add_url_rule('/api/search',               view_func=login_required(api_search))
    app.add_url_rule('/api/recommend',            view_func=login_required(api_recommend),      methods=['POST'])

    # ── Favorit ───────────────────────────────────────
    app.add_url_rule('/api/favorit',              view_func=login_required(api_favorit))
    app.add_url_rule('/api/favorit/list',         view_func=login_required(api_favorit_list))
    app.add_url_rule('/api/favorit/toggle',       view_func=login_required(api_favorit_toggle), methods=['POST'])