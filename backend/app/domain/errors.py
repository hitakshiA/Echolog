class NotFoundError(Exception):
    def __init__(self, resource: str, resource_id: int):
        self.resource = resource
        self.resource_id = resource_id
        super().__init__(f"{resource} with id {resource_id} not found")


class InvalidStatusTransitionError(Exception):
    def __init__(self, current: str, requested: str, allowed: list[str]):
        self.current = current
        self.requested = requested
        self.allowed = allowed
        super().__init__(f"Cannot transition from {current} to {requested}")


class ValidationError(Exception):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__(f"Validation failed: {', '.join(errors)}")


class LLMError(Exception):
    def __init__(self, message: str, provider: str | None = None):
        self.provider = provider
        super().__init__(message)


class LLMConfigError(Exception):
    pass
