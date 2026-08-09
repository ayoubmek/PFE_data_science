package com.pfe.platform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseService {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        // 30 minutes timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        this.emitters.add(emitter);

        emitter.onCompletion(() -> {
            log.info("SSE connection completed");
            this.emitters.remove(emitter);
        });

        emitter.onTimeout(() -> {
            log.info("SSE connection timed out");
            this.emitters.remove(emitter);
        });

        emitter.onError(e -> {
            log.warn("SSE connection error: {}", e.getMessage());
            this.emitters.remove(emitter);
        });

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connected to Nexora Machine Live Stream"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastMachineEvent(String eventName, Object data) {
        log.info("Broadcasting SSE event '{}' to {} subscribers", eventName, emitters.size());
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                log.warn("Failed to send SSE event, removing emitter", e);
                emitters.remove(emitter);
            }
        }
    }
}
