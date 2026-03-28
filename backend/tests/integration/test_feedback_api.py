class TestCreateFeedback:
    def test_create_success(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "The login page is broken and I cannot access my account",
                "source": "support_ticket",
            },
        )
        assert r.status_code == 201
        data = r.get_json()
        assert data["status"] == "new"
        assert data["source"] == "support_ticket"

    def test_create_without_source(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Great app, love the design and everything about it",
            },
        )
        assert r.status_code == 201
        assert r.get_json()["source"] is None

    def test_create_content_too_short(self, client):
        r = client.post("/api/feedback", json={"content": "short"})
        assert r.status_code == 422
        assert r.get_json()["error"]["code"] == "VALIDATION_ERROR"

    def test_create_empty_body(self, client):
        r = client.post("/api/feedback", json={})
        assert r.status_code == 422


class TestBulkCreate:
    def test_bulk_create_success(self, client):
        r = client.post(
            "/api/feedback/bulk",
            json={
                "items": [
                    {"content": "First feedback item, this is long enough"},
                    {"content": "Second feedback item, also long enough"},
                ]
            },
        )
        assert r.status_code == 201
        assert len(r.get_json()) == 2


class TestListFeedback:
    def test_list_empty(self, client):
        r = client.get("/api/feedback")
        assert r.status_code == 200
        data = r.get_json()
        assert data["total"] == 0
        assert data["items"] == []

    def test_list_with_items(self, client):
        client.post(
            "/api/feedback",
            json={
                "content": "Feedback one, this is long enough to pass validation",
            },
        )
        client.post(
            "/api/feedback",
            json={
                "content": "Feedback two, also long enough to pass validation",
            },
        )
        r = client.get("/api/feedback")
        data = r.get_json()
        assert data["total"] == 2

    def test_list_filter_by_status(self, client):
        client.post(
            "/api/feedback",
            json={
                "content": "Feedback one, this is long enough to pass validation",
            },
        )
        r = client.get("/api/feedback?status=resolved")
        assert r.get_json()["total"] == 0

    def test_list_pagination(self, client):
        for i in range(5):
            client.post(
                "/api/feedback",
                json={
                    "content": f"Feedback item number {i}, long enough to pass",
                },
            )
        r = client.get("/api/feedback?page=1&per_page=2")
        data = r.get_json()
        assert len(data["items"]) == 2
        assert data["total"] == 5
        assert data["total_pages"] == 3


class TestGetFeedback:
    def test_get_success(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Test feedback for get endpoint, long enough",
            },
        )
        item_id = r.get_json()["id"]
        r = client.get(f"/api/feedback/{item_id}")
        assert r.status_code == 200
        assert r.get_json()["id"] == item_id

    def test_get_not_found(self, client):
        r = client.get("/api/feedback/999")
        assert r.status_code == 404


class TestUpdateStatus:
    def test_valid_transition(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Test feedback for status update, long enough",
            },
        )
        item_id = r.get_json()["id"]
        r = client.patch(f"/api/feedback/{item_id}/status", json={"status": "analyzing"})
        assert r.status_code == 200
        assert r.get_json()["status"] == "analyzing"

    def test_invalid_transition(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Test feedback for invalid transition, long enough",
            },
        )
        item_id = r.get_json()["id"]
        r = client.patch(f"/api/feedback/{item_id}/status", json={"status": "resolved"})
        assert r.status_code == 422
        assert r.get_json()["error"]["code"] == "INVALID_STATUS_TRANSITION"


class TestUpdateNote:
    def test_update_note(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Test feedback for note update, this is long enough",
            },
        )
        item_id = r.get_json()["id"]
        r = client.patch(
            f"/api/feedback/{item_id}/note",
            json={
                "note": "Investigating this",
            },
        )
        assert r.status_code == 200
        assert r.get_json()["note"] == "Investigating this"


class TestDeleteFeedback:
    def test_delete_success(self, client):
        r = client.post(
            "/api/feedback",
            json={
                "content": "Test feedback for deletion, this is long enough",
            },
        )
        item_id = r.get_json()["id"]
        r = client.delete(f"/api/feedback/{item_id}")
        assert r.status_code == 204
        r = client.get(f"/api/feedback/{item_id}")
        assert r.status_code == 404
