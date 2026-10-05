# ---------- Build ----------
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build

# pom.xml is copied first on purpose: the dependency download layer is only
# rebuilt when the dependencies change, not on every source code change.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Run ----------
FROM eclipse-temurin:25-jre
WORKDIR /app

# curl is only used by the container healthcheck (no Spring Boot Actuator here).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --system --create-home appuser

COPY --from=build /build/target/*.jar app.jar

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=45s --retries=10 \
    CMD curl -fsS http://localhost:8080/api/tasks || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]