


01:28:45.794] INFO (4000): AgentActivity mainTask: exiting   
[01:28:46.184] DEBUG (4000): VAD task closed
[01:28:46.203] DEBUG (4000): Agent handoff inserted into chat 
context
    previousAgentId: "ailana_voice_agent"
    newAgentId: "ailana_voice_agent"
[01:28:46.237] DEBUG (4000): Task.runTask: task AgentActivity_onEnter started
[01:28:46.260] DEBUG (4000): Task.runTask: task AgentActivity_onEnter done
[01:28:46.267] DEBUG (4000): Task.runTask: task AgentSession_updateActivityTask done
[01:28:46.285] WARN (4000): inference is slower than realtime 
    delay: 894
    
    model: "turn-detector-v1"
    thresholds: {
      "ar": 0.2008,
      "de": 0.4032,
      "en": 0.3857,
      "fr": 0.4042,
      "hi": 0.3604,
      "id": 0.2892,
      "it": 0.4047,
      "nl": 0.5027,
      "es": 0.4827,
      "ja": 0.3249,
      "ko": 0.4025,
      "pt": 0.2113,
      "tr": 0.31,
      "zh": 0.2566
    }
    defaultThreshold: 0.3857
[01:28:47.377] WARN (4000): inference is slower than realtime
    delay: 368
[01:28:47.439] WARN (4000): inference is slower than realtime
    delay: 396
[01:28:47.452] WARN (4000): inference is slower than realtime
    delay: 374
[01:28:47.467] WARN (4000): inference is slower than realtime
    delay: 352
[01:28:47.488] WARN (4000): inference is slower than realtime 
    delay: 335
[01:28:47.492] WARN (4000): inference is slower than realtime
    delay: 306
[01:28:47.503] WARN (4000): inference is slower than realtime 
    delay: 283
[01:28:47.508] WARN (4000): inference is slower than realtime 
    delay: 254
[01:28:47.559] WARN (4000): inference is slower than realtime
    delay: 266
[01:28:47.718] WARN (4000): inference is slower than realtime
    delay: 381
[01:28:47.724] WARN (4000): inference is slower than realtime
    delay: 352
[01:28:47.728] WARN (4000): inference is slower than realtime 
    delay: 323
[01:28:47.734] WARN (4000): inference is slower than realtime
    delay: 295
[01:28:47.746] WARN (4000): inference is slower than realtime 
    delay: 273
[01:28:47.757] WARN (4000): inference is slower than realtime 
    delay: 246
[01:28:47.772] WARN (4000): inference is slower than realtime 
    delay: 227
[01:28:47.783] WARN (4000): inference is slower than realtime 
    delay: 204
[01:28:49.200] DEBUG (4000): VAD task: START_OF_SPEECH
[01:28:50.159] DEBUG (4000): interim transcript
    transcript: "Uh"
[01:28:50.594] DEBUG (4000): interim transcript
    transcript: "Uh yes,"
[01:28:50.616] DEBUG (4000): interim transcript
    transcript: "Uh yes, I"
[01:28:50.792] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would"
[01:28:51.001] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would like to"
[01:28:51.447] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would like to connect"
[01:28:51.612] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would like to connect to"
[01:28:51.701] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would like to connect to the loan officer"
[01:28:51.705] DEBUG (4000): interim transcript
    transcript: "Uh yes, I would like to connect to the loan officer."
[01:28:51.709] DEBUG (4000): received user preflight transcript
    user_transcript: "Uh yes, I would like to connect to the loan officer."
    language: "en"
[01:28:51.712] DEBUG (4000): triggering preemptive generation 
(PREFLIGHT_TRANSCRIPT)
    transcript: "Uh yes, I would like to connect to the loan officer."
[01:28:51.838] DEBUG (4000): VAD task: END_OF_SPEECH
[agent-hook]: Transient noise detected (no words produced). Duration: 0ms.
[01:28:51.840] DEBUG (4000): running EOU detection
    audioTranscript: ""
[01:28:51.840] DEBUG (4000): skipping EOU detection
[pipeline][20:28:51.995] STT final transcript: "Uh yes, I would like to connect to the loan officer."
[pipeline][20:28:52.004] STT complete (5782ms): "Uh yes, I would like to connect to the loan officer."
[01:28:52.020] DEBUG (4000): received user transcript
    user_transcript: "Uh yes, I would like to connect to the loan officer."
    language: "en"
[01:28:52.021] DEBUG (4000): running EOU detection on stt FINAL_TRANSCRIPT
[01:28:52.022] DEBUG (4000): running EOU detection
    audioTranscript: "Uh yes, I would like to connect to the loan officer."
[01:28:52.029] DEBUG (4000): Running turn detector model      
[agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yes, I would like to connect to the loan officer."       
[voice-mlo-transfer]: intent accepted source=contextual_confirmation pendingField=escalation_preference.
[voice-mlo-transfer]: accepted customer ZIP zip=44800; dispatching authoritative transfer handler.
[agent-hook]: Suppressing mortgage LLM reply because a global 
voice action owns this turn.
[agent-debug]: Agent state: listening → thinking
[agent-debug]: Agent state: thinking → listening
[silent-turn-guard]: Ignoring preemptive-gen cycle (thinking lasted only 11ms).
[agent]: �📞 MLO transfer requested; validating the mapped qu
e before stopping Ailana.
[01:28:52.108] DEBUG (4000): eot prediction
    endOfTurnProbability: 0.8996223211288452
    unlikelyThreshold: 0.3857
    endpointingDelay: 100
    language: "en"
    trigger: "stt"
    fromCache: false
[01:28:52.113] DEBUG (4000): end of user turn
    transcript: "Uh yes, I would like to connect to the loan officer."
[01:28:52.114] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted started
[01:28:52.125] INFO (4000): Creating speech handle
    speech_id: "speech_8d7f6925-b82"
[01:28:52.127] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:28:52.129] DEBUG (4000): Task.runTask: task performLLMInference started
[01:28:52.146] DEBUG (4000): EOU detection task completed     
[01:28:52.147] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted done
[01:28:52.154] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:28:52.160] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:28:52.161] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:28:52.162] DEBUG (4000): Task.runTask: task performLLMInference done
[01:28:52.163] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:28:52.173] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
[agent]: �📞 Sent SYSTEM_TRIGGER_MLO_TRANSFER to frontend ove
DataChannel.
[01:28:52.463] WARN (4000): inference is slower than realtime
    delay: 324
[01:28:52.499] WARN (4000): inference is slower than realtime
    delay: 323
[01:28:52.551] WARN (4000): inference is slower than realtime
    delay: 340
[01:28:52.574] WARN (4000): inference is slower than realtime
    delay: 329
[01:28:52.624] WARN (4000): inference is slower than realtime
    delay: 342
[01:28:52.666] WARN (4000): inference is slower than realtime
    delay: 350
[01:28:52.762] WARN (4000): inference is slower than realtime
    delay: 394
[01:28:52.970] WARN (4000): inference is slower than realtime
    delay: 565
[01:28:52.975] WARN (4000): inference is slower than realtime
    delay: 536
[01:28:53.033] WARN (4000): inference is slower than realtime
    delay: 560
[01:28:53.045] WARN (4000): inference is slower than realtime
    delay: 538
[01:28:53.157] WARN (4000): inference is slower than realtime 
    delay: 616
[01:28:53.165] WARN (4000): inference is slower than realtime 
    delay: 587
[01:28:53.173] WARN (4000): inference is slower than realtime 
    delay: 561
[01:28:53.180] WARN (4000): inference is slower than realtime 
    delay: 532
[01:28:53.304] WARN (4000): inference is slower than realtime 
    delay: 620
[01:28:53.336] WARN (4000): inference is slower than realtime
    delay: 618
[01:28:53.346] WARN (4000): inference is slower than realtime 
    delay: 589
[01:28:53.433] WARN (4000): inference is slower than realtime 
    delay: 642
[01:28:53.460] WARN (4000): inference is slower than realtime 
    delay: 635
[01:28:53.467] WARN (4000): inference is slower than realtime
    delay: 607
[01:28:53.486] WARN (4000): inference is slower than realtime
    delay: 592
[01:28:53.533] WARN (4000): inference is slower than realtime
    delay: 603
[01:28:53.541] WARN (4000): inference is slower than realtime
    delay: 577
[01:28:53.764] WARN (4000): inference is slower than realtime
    delay: 751
[01:28:53.803] WARN (4000): inference is slower than realtime
    delay: 755
[01:28:53.812] WARN (4000): inference is slower than realtime
    delay: 728
[01:28:53.833] WARN (4000): inference is slower than realtime
    delay: 714
[01:28:53.869] WARN (4000): inference is slower than realtime
    delay: 711
[01:28:53.884] WARN (4000): inference is slower than realtime
    delay: 693
[01:28:53.900] WARN (4000): inference is slower than realtime
    delay: 676
[01:28:53.907] WARN (4000): inference is slower than realtime
    delay: 648
[01:28:53.927] WARN (4000): inference is slower than realtime
    delay: 633
[01:28:53.968] WARN (4000): inference is slower than realtime
    delay: 635
[01:28:53.997] WARN (4000): inference is slower than realtime 
    delay: 627
[01:28:54.004] WARN (4000): inference is slower than realtime
    delay: 600
[01:28:54.038] WARN (4000): inference is slower than realtime
    delay: 586
[01:28:54.075] WARN (4000): inference is slower than realtime
    delay: 572
[01:28:54.117] WARN (4000): inference is slower than realtime
    delay: 574
[01:28:54.140] WARN (4000): inference is slower than realtime
    delay: 562
[01:28:54.148] WARN (4000): inference is slower than realtime
    delay: 536
[01:28:54.161] WARN (4000): inference is slower than realtime
    delay: 513
[01:28:54.239] WARN (4000): inference is slower than realtime
    delay: 545
[01:28:54.268] WARN (4000): inference is slower than realtime
    delay: 540
[01:28:54.284] WARN (4000): inference is slower than realtime
    delay: 523
[01:28:54.303] WARN (4000): inference is slower than realtime
    delay: 505
[01:28:54.331] WARN (4000): inference is slower than realtime
    delay: 499
[01:28:54.367] WARN (4000): inference is slower than realtime
    delay: 501
[01:28:54.419] WARN (4000): inference is slower than realtime
    delay: 505
[01:28:54.432] WARN (4000): inference is slower than realtime
    delay: 485
[01:28:54.445] WARN (4000): inference is slower than realtime
    delay: 463
[01:28:54.451] WARN (4000): inference is slower than realtime
    delay: 435
[01:28:54.485] WARN (4000): inference is slower than realtime
    delay: 434
[01:28:54.500] WARN (4000): inference is slower than realtime
    delay: 416
[01:28:54.527] WARN (4000): inference is slower than realtime
    delay: 409
[01:28:54.539] WARN (4000): inference is slower than realtime
    delay: 385
[01:28:54.558] WARN (4000): inference is slower than realtime
    delay: 361
[01:28:54.694] WARN (4000): inference is slower than realtime
    delay: 461
[01:28:54.755] WARN (4000): inference is slower than realtime
    delay: 488
[01:28:54.765] WARN (4000): inference is slower than realtime
    delay: 462
[01:28:54.786] WARN (4000): inference is slower than realtime 
    delay: 448
[01:28:54.824] WARN (4000): inference is slower than realtime 
    delay: 452
[01:28:54.853] WARN (4000): inference is slower than realtime
    delay: 447
[01:28:54.863] WARN (4000): inference is slower than realtime 
    delay: 422
[01:28:54.923] WARN (4000): inference is slower than realtime 
    delay: 448
[01:28:54.984] WARN (4000): inference is slower than realtime
    delay: 470
[01:28:54.996] WARN (4000): inference is slower than realtime
    delay: 448
[01:28:55.018] WARN (4000): inference is slower than realtime 
    delay: 423
[01:28:55.023] WARN (4000): inference is slower than realtime 
    delay: 394
[01:28:55.027] WARN (4000): inference is slower than realtime 
    delay: 364
[01:28:55.081] WARN (4000): inference is slower than realtime
    delay: 364
[01:28:55.113] WARN (4000): inference is slower than realtime 
    delay: 358
[01:28:55.172] WARN (4000): inference is slower than realtime
    delay: 378
[01:28:55.217] WARN (4000): inference is slower than realtime 
    delay: 389
[01:28:55.249] WARN (4000): inference is slower than realtime
    delay: 386
[01:28:55.312] WARN (4000): inference is slower than realtime 
    delay: 415
[01:28:55.357] WARN (4000): inference is slower than realtime
    delay: 426
[01:28:55.593] WARN (4000): inference is slower than realtime
    delay: 588
[01:28:55.616] WARN (4000): inference is slower than realtime
    delay: 577
[01:28:55.674] WARN (4000): inference is slower than realtime 
    delay: 601
[01:28:55.685] WARN (4000): inference is slower than realtime
    delay: 578
[01:28:55.735] WARN (4000): inference is slower than realtime 
    delay: 593
[01:28:55.744] WARN (4000): inference is slower than realtime
    delay: 569
[01:28:55.755] WARN (4000): inference is slower than realtime
    delay: 546
[01:28:55.762] WARN (4000): inference is slower than realtime 
    delay: 519
[01:28:55.801] WARN (4000): inference is slower than realtime
    delay: 523
[01:28:55.806] WARN (4000): inference is slower than realtime 
    delay: 494
[01:28:55.814] WARN (4000): inference is slower than realtime 
    delay: 466
[01:28:55.819] WARN (4000): inference is slower than realtime 
    delay: 437
[01:28:55.830] WARN (4000): inference is slower than realtime 
    delay: 412
[01:28:55.835] WARN (4000): inference is slower than realtime 
    delay: 384
[01:28:55.845] WARN (4000): inference is slower than realtime 
    delay: 356
[01:28:55.850] WARN (4000): inference is slower than realtime
    delay: 327
[01:28:55.860] WARN (4000): inference is slower than realtime 
    delay: 303
[01:28:55.879] WARN (4000): inference is slower than realtime 
    delay: 288
[01:28:55.894] WARN (4000): inference is slower than realtime 
    delay: 269
[01:28:55.914] WARN (4000): inference is slower than realtime
    delay: 254
[01:28:55.920] WARN (4000): inference is slower than realtime 
    delay: 227
[01:28:55.935] WARN (4000): inference is slower than realtime 
    delay: 207
[agent]: SIP transfer did not complete: connect ETIMEDOUT 192.168.10.10:5432
[voice-scheduling]: started reason=queue_timeout zip=44800 queue=unknown
[01:29:35.011] DEBUG (4000): Task.runTask: task AgentActivity.tts_say started
[01:29:35.012] DEBUG (4000): Task.runTask: task performTextForwarding started
[01:29:35.012] DEBUG (4000): Task.runTask: task performTTSInference started
[01:29:35.013] DEBUG (4000): Task.runTask: task performAudioForwarding started
[01:29:35.021] DEBUG (4000): Task.runTask: task performTextForwarding done
[01:29:35.026] DEBUG (4000): Task.runTask: task inference-tts-input started
[01:29:35.026] DEBUG (4000): Task.runTask: task inference-tts-sentence started
[01:29:35.026] DEBUG (4000): Task.runTask: task inference-tts-ws-listener started
[01:29:35.027] DEBUG (4000): Task.runTask: task inference-tts-recv started
[01:29:35.030] DEBUG (4000): Task.runTask: task inference-tts-input done
[01:29:35.031] DEBUG (4000): Task.runTask: task inference-tts-sentence done
[01:29:35.871] DEBUG (4000): Task.runTask: task inference-tts-recv done
[01:29:35.872] DEBUG (4000): Task.runTask: task inference-tts-ws-listener done
[01:29:35.872] DEBUG (4000): Task.runTask: task performTTSInference done
[01:29:35.921] DEBUG (4000): Task.runTask: task performAudioForwarding done
[agent-debug]: Agent state: listening → speaking

[pipeline][20:29:38.091] ── TURN 29 METRICS SUMMARY ──        
  • STT Processing: 5782ms
  • EOU Delay (User End → LLM Start): ?
  • LLM TTFT (LLM Start → First Token): ?
  • LLM Total (LLM Start → Complete): ?
  • TTS TTFB (TTS Start → First Audio Byte): 355ms
  • TTS Total (TTS Start → Complete): 857ms
  • LemonSlice Render & Network (TTS TTFB → Avatar Frame): 1723ms
  • E2E Latency (User End → Avatar Frame): ?
───────────────────────────────────────────────────
[01:29:43.147] INFO (4000): playback finished event received
    callerIdentity: "lemonslice-avatar-agent"
[agent-debug]: Agent state: speaking → listening
[voice-scheduling]: deterministic availability/callback offer 
delivered reason=queue_timeout queue=unknown
[01:29:43.155] DEBUG (4000): Task.runTask: task AgentActivity.tts_say done
[voice-scheduling]: deterministic availability/callback offer 
delivered reason=queue_timeout queue=unknown
[01:29:43.155] DEBUG (4000): Task.runTask: task AgentActivity.tts_say done
[01:29:59.774] DEBUG (4000): VAD task: START_OF_SPEECH
[01:30:00.913] DEBUG (4000): interim transcript
    transcript: "Sure"
[01:30:01.196] DEBUG (4000): VAD task: END_OF_SPEECH
[agent-hook]: Transient noise detected (no words produced). Duration: 0ms.
[01:30:01.198] DEBUG (4000): running EOU detection
    audioTranscript: ""
[01:30:01.199] DEBUG (4000): skipping EOU detection
[01:30:01.424] DEBUG (4000): interim transcript
    transcript: "Sure, let"
[01:30:01.437] DEBUG (4000): interim transcript
    transcript: "Sure, let's"
[01:30:01.717] DEBUG (4000): interim transcript
    transcript: "Sure, let's schedule"
[01:30:01.736] DEBUG (4000): interim transcript
    transcript: "Sure, let's schedule."
[01:30:01.752] DEBUG (4000): received user preflight transcript
    user_transcript: "Sure, let's schedule."
    language: "en"
[01:30:01.753] DEBUG (4000): triggering preemptive generation 
(PREFLIGHT_TRANSCRIPT)
    transcript: "Sure, let's schedule."
[01:30:01.853] WARN (4000): inference is slower than realtime
    delay: 232
[01:30:01.981] WARN (4000): inference is slower than realtime 
    delay: 325
[pipeline][20:30:02.096] STT final transcript: "Sure, let's schedule."
[pipeline][20:30:02.244] STT complete (?): "Sure, let's schedule."
[agent-hook]: onUserTurnCompleted hook triggered with message: "Sure, let's schedule."
[voice-scheduling]: scheduling prompt retained; mortgage stage extraction bypassed for "Sure, let's schedule.".
[agent-debug]: Agent state: listening → thinking
[01:30:02.276] DEBUG (4000): received user transcript
    user_transcript: "Sure, let's schedule."
    language: "en"
[01:30:02.277] DEBUG (4000): running EOU detection on stt FINAL_TRANSCRIPT
[01:30:02.280] DEBUG (4000): running EOU detection
    audioTranscript: "Sure, let's schedule."
[01:30:02.294] DEBUG (4000): Running turn detector model      
[01:30:02.295] DEBUG (4000): eot prediction
    endOfTurnProbability: 0.6680280566215515
    unlikelyThreshold: 0.3857
    endpointingDelay: 100
    language: "en"
    trigger: "stt"
    fromCache: true
[01:30:02.301] DEBUG (4000): end of user turn
    transcript: "Sure, let's schedule."
[01:30:02.302] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted started
[01:30:02.364] INFO (4000): Creating speech handle
    speech_id: "speech_189e8787-b9c"
[01:30:02.365] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:30:02.367] DEBUG (4000): Task.runTask: task performLLMInference started
[01:30:02.389] DEBUG (4000): EOU detection task completed     
[01:30:02.391] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted done
[01:30:02.395] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:30:02.480] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:30:03.107] WARN (4000): inference is slower than realtime 
    delay: 1417
[01:30:03.142] WARN (4000): inference is slower than realtime
    delay: 1415
[01:30:03.147] WARN (4000): inference is slower than realtime 
    delay: 1387
[01:30:03.152] WARN (4000): inference is slower than realtime 
    delay: 1358
[01:30:03.171] WARN (4000): inference is slower than realtime 
    delay: 1343
[01:30:03.181] WARN (4000): inference is slower than realtime 
    delay: 1320
[01:30:03.185] WARN (4000): inference is slower than realtime 
    delay: 1291
[01:30:03.192] WARN (4000): inference is slower than realtime 
    delay: 1262
[01:30:03.197] WARN (4000): inference is slower than realtime 
    delay: 1232
[01:30:03.204] WARN (4000): inference is slower than realtime 
    delay: 1206
[01:30:03.222] WARN (4000): inference is slower than realtime 
    delay: 1190
[01:30:03.246] WARN (4000): inference is slower than realtime
    delay: 1179
[01:30:03.256] WARN (4000): inference is slower than realtime 
    delay: 1155
[01:30:03.263] WARN (4000): inference is slower than realtime 
    delay: 1128
[01:30:03.271] WARN (4000): inference is slower than realtime 
    delay: 1101
[01:30:03.276] WARN (4000): inference is slower than realtime 
    delay: 1072
[01:30:03.294] WARN (4000): inference is slower than realtime 
    delay: 1057
[01:30:03.316] WARN (4000): inference is slower than realtime 
    delay: 1039
[01:30:03.344] WARN (4000): inference is slower than realtime 
    delay: 1032
[01:30:03.449] WARN (4000): inference is slower than realtime
    delay: 1016
[01:30:03.455] WARN (4000): inference is slower than realtime 
    delay: 986
[01:30:03.460] WARN (4000): inference is slower than realtime 
    delay: 956
[01:30:03.465] WARN (4000): inference is slower than realtime 
    delay: 928
[01:30:03.473] WARN (4000): inference is slower than realtime 
    delay: 902
[01:30:03.679] WARN (4000): inference is slower than realtime 
    delay: 1059
[01:30:03.944] WARN (4000): inference is slower than realtime
    delay: 1289
[01:30:03.957] WARN (4000): inference is slower than realtime 
    delay: 1269
[01:30:03.962] WARN (4000): inference is slower than realtime 
    delay: 1240
[01:30:03.966] WARN (4000): inference is slower than realtime 
    delay: 1210
[01:30:03.973] WARN (4000): inference is slower than realtime 
    delay: 1182
[01:30:03.978] WARN (4000): inference is slower than realtime 
    delay: 1153
[01:30:03.983] WARN (4000): inference is slower than realtime
    delay: 1124
[01:30:04.024] WARN (4000): inference is slower than realtime 
    delay: 1131
[01:30:04.027] WARN (4000): inference is slower than realtime
    delay: 1101
[01:30:04.032] WARN (4000): inference is slower than realtime
    delay: 1072
[01:30:04.069] WARN (4000): inference is slower than realtime
    delay: 1062
[01:30:04.076] WARN (4000): inference is slower than realtime
    delay: 1035
[01:30:04.082] WARN (4000): inference is slower than realtime
    delay: 1006
[01:30:04.092] WARN (4000): inference is slower than realtime 
    delay: 977
[01:30:04.109] WARN (4000): inference is slower than realtime 
    delay: 961
[01:30:04.113] WARN (4000): inference is slower than realtime
    delay: 931
[01:30:04.123] WARN (4000): inference is slower than realtime 
    delay: 908
[01:30:04.131] WARN (4000): inference is slower than realtime 
    delay: 882
[01:30:04.144] WARN (4000): inference is slower than realtime 
    delay: 862
[01:30:04.156] WARN (4000): inference is slower than realtime 
    delay: 839
[01:30:04.184] WARN (4000): inference is slower than realtime
    delay: 834
[01:30:04.196] WARN (4000): inference is slower than realtime 
    delay: 810
[01:30:04.202] WARN (4000): inference is slower than realtime 
    delay: 782
[01:30:04.212] WARN (4000): inference is slower than realtime
    delay: 759
[01:30:04.216] WARN (4000): inference is slower than realtime
    delay: 729
[01:30:04.224] WARN (4000): inference is slower than realtime
    delay: 701
[01:30:04.234] WARN (4000): inference is slower than realtime
    delay: 673
[01:30:04.245] WARN (4000): inference is slower than realtime 
    delay: 647
[01:30:04.275] WARN (4000): inference is slower than realtime
    delay: 642
[01:30:04.291] WARN (4000): inference is slower than realtime
    delay: 624
[01:30:04.295] WARN (4000): inference is slower than realtime
    delay: 595
[01:30:04.308] WARN (4000): inference is slower than realtime 
    delay: 574
[01:30:04.319] WARN (4000): inference is slower than realtime
    delay: 552
[01:30:04.355] WARN (4000): inference is slower than realtime
    delay: 550
[01:30:04.362] WARN (4000): inference is slower than realtime
    delay: 522
[01:30:04.377] WARN (4000): inference is slower than realtime
    delay: 504
[01:30:04.387] WARN (4000): inference is slower than realtime
    delay: 479
[01:30:04.395] WARN (4000): inference is slower than realtime
    delay: 454
[01:30:04.409] WARN (4000): inference is slower than realtime 
    delay: 434
[01:30:04.427] WARN (4000): inference is slower than realtime
    delay: 418
[01:30:04.442] WARN (4000): inference is slower than realtime 
    delay: 400
[01:30:04.457] WARN (4000): inference is slower than realtime
    delay: 381
[01:30:04.473] WARN (4000): inference is slower than realtime 
    delay: 363
[01:30:04.481] WARN (4000): inference is slower than realtime
    delay: 338
[01:30:04.493] WARN (4000): inference is slower than realtime
    delay: 316
[01:30:04.497] WARN (4000): inference is slower than realtime
    delay: 287
[01:30:04.507] WARN (4000): inference is slower than realtime
    delay: 263
[01:30:04.513] WARN (4000): inference is slower than realtime 
    delay: 235
[01:30:04.530] WARN (4000): inference is slower than realtime
    delay: 210
[01:30:04.568] DEBUG (4000): Task.runTask: task performTTSInference started
[01:30:04.572] DEBUG (4000): Task.runTask: task performTextForwarding started
[01:30:04.572] DEBUG (4000): Task.runTask: task performAudioForwarding started
[01:30:04.589] DEBUG (4000): Task.runTask: task inference-tts-input started
[01:30:04.590] DEBUG (4000): Task.runTask: task inference-tts-sentence started
[01:30:04.591] DEBUG (4000): Task.runTask: task inference-tts-ws-listener started
[01:30:04.591] DEBUG (4000): Task.runTask: task inference-tts-recv started
[pipeline][20:30:04.811] LLM metrics — TTFT=2197ms  prompt_tokens=2563  cached_tokens=0 [CACHE MISS/COLD]  completion_tokens=40
[01:30:04.817] DEBUG (4000): Task.runTask: task performTextForwarding done
[01:30:04.819] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:30:04.819] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:30:04.819] DEBUG (4000): Task.runTask: task performLLMInference done
[01:30:04.821] DEBUG (4000): Task.runTask: task inference-tts-input done
[01:30:04.821] DEBUG (4000): Task.runTask: task inference-tts-sentence done
[01:30:05.424] DEBUG (4000): Task.runTask: task inference-tts-recv done
[01:30:05.424] DEBUG (4000): Task.runTask: task inference-tts-ws-listener done
[01:30:05.425] DEBUG (4000): Task.runTask: task performTTSInference done
[01:30:05.454] DEBUG (4000): Task.runTask: task performAudioForwarding done
[agent-debug]: Agent state: thinking → speaking

[pipeline][20:30:08.089] ── TURN 30 METRICS SUMMARY ──        
  • STT Processing: ?
  • EOU Delay (User End → LLM Start): 94ms
  • LLM TTFT (LLM Start → First Token): 2197ms
  • LLM Total (LLM Start → Complete): 2441ms
  • TTS TTFB (TTS Start → First Audio Byte): 359ms
  • TTS Total (TTS Start → Complete): 853ms
  • LemonSlice Render & Network (TTS TTFB → Avatar Frame): 2161ms
  • E2E Latency (User End → Avatar Frame): 4814ms
───────────────────────────────────────────────────
[01:30:09.955] INFO (4000): playback finished event received
    callerIdentity: "lemonslice-avatar-agent"
[agent-debug]: Agent state: speaking → listening
[01:30:09.961] INFO (4000): playout completed without interruption
    speech_id: "speech_189e8787-b9c"
    message: "<expr type=\"expression\" label=\"confident\"/> 
I can help with that. <expr type=\"break\" label=\"300ms\"/> What date and time would work best for you?"
[01:30:09.964] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
[01:30:12.349] DEBUG (4000): VAD task: START_OF_SPEECH
[01:30:13.847] DEBUG (4000): interim transcript
    transcript: "Tomorrow"
[01:30:13.865] DEBUG (4000): interim transcript
    transcript: "Tomorrow 5 PM"
[01:30:13.884] DEBUG (4000): interim transcript
    transcript: "Tomorrow 5 PM."
[01:30:13.886] DEBUG (4000): received user preflight transcript
    user_transcript: "Tomorrow 5 PM."
    language: "en"
[01:30:13.887] DEBUG (4000): triggering preemptive generation 
(PREFLIGHT_TRANSCRIPT)
    transcript: "Tomorrow 5 PM."
[01:30:14.207] DEBUG (4000): VAD task: END_OF_SPEECH
[agent-hook]: Transient noise detected (no words produced). Duration: 0ms.
[01:30:14.208] DEBUG (4000): running EOU detection
    audioTranscript: ""
[01:30:14.209] DEBUG (4000): skipping EOU detection
[pipeline][20:30:14.247] STT final transcript: "Tomorrow 5 PM."
[pipeline][20:30:14.248] STT complete (?): "Tomorrow 5 PM."
[01:30:14.249] DEBUG (4000): received user transcript
    user_transcript: "Tomorrow 5 PM."
    language: "en"
[agent-hook]: onUserTurnCompleted hook triggered with message: "Tomorrow 5 PM."
[voice-scheduling]: scheduling prompt retained; mortgage stage extraction bypassed for "Tomorrow 5 PM.".
[agent-debug]: Agent state: listening → thinking
[01:30:14.249] DEBUG (4000): running EOU detection on stt FINAL_TRANSCRIPT
[01:30:14.249] DEBUG (4000): running EOU detection
    audioTranscript: "Tomorrow 5 PM."
[01:30:14.251] DEBUG (4000): Running turn detector model      
[01:30:14.251] DEBUG (4000): eot prediction
    endOfTurnProbability: 0.9063236713409424
    unlikelyThreshold: 0.3857
    endpointingDelay: 100
    language: "en"
    trigger: "stt"
    fromCache: true
[01:30:14.253] DEBUG (4000): end of user turn
    transcript: "Tomorrow 5 PM."
[01:30:14.253] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted started
[01:30:14.255] INFO (4000): Creating speech handle
    speech_id: "speech_9877270f-ebb"
[01:30:14.256] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:30:14.256] DEBUG (4000): Task.runTask: task performLLMInference started
[01:30:14.258] DEBUG (4000): EOU detection task completed     
[01:30:14.261] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted done
[01:30:14.264] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:30:14.266] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:30:15.377] INFO (4000): Executing LLM tool call
    function: "findMeetingTimes"
    arguments: {
      "requestedDate": "2026-11-08",
      "customerTimeZone": "America/Chicago"
    }
    speech_id: "speech_9877270f-ebb"
[pipeline][20:30:15.384] LLM metrics — TTFT=1117ms  prompt_tokens=2617  cached_tokens=64 [CACHE HIT: 64 tokens]  completion_tokens=34
[01:30:15.378] DEBUG (4000): Task.runTask: task performToolExecution:findMeetingTimes started
[01:30:15.387] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:30:15.387] DEBUG (4000): Task.runTask: task performLLMInference done
[01:30:36.388] ERROR (4000): exception occurred while executing tool
    function: "findMeetingTimes"
    speech_id: "speech_9877270f-ebb"
    error: "connect ETIMEDOUT 192.168.10.10:5432"
[01:30:36.393] DEBUG (4000): Task.runTask: task performToolExecution:findMeetingTimes done
[01:30:36.394] DEBUG (4000): tools execution completed        
    speech_id: "speech_9877270f-ebb"
[01:30:36.394] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:30:36.395] DEBUG (findMeetingTimes/4000): Tool call execution finished
    speechId: "speech_9877270f-ebb"
    args: "{\"customerTimeZone\":\"America/Chicago\",\"requestedDate\":\"2026-11-08\"}"
    output: "An internal error occurred"
    isError: true
[01:30:36.399] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:30:36.400] DEBUG (4000): Task.runTask: task performLLMInference started
[01:30:36.402] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:30:36.403] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
[01:30:36.403] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:30:38.377] DEBUG (4000): Task.runTask: task performTTSInference started
[01:30:38.379] DEBUG (4000): Task.runTask: task performTextForwarding started
[01:30:38.379] DEBUG (4000): Task.runTask: task performAudioForwarding started
[01:30:38.381] DEBUG (4000): Task.runTask: task inference-tts-input started
[01:30:38.381] DEBUG (4000): Task.runTask: task inference-tts-sentence started
[01:30:38.381] DEBUG (4000): Task.runTask: task inference-tts-ws-listener started
[01:30:38.382] DEBUG (4000): Task.runTask: task inference-tts-recv started
[pipeline][20:30:38.628] LLM metrics — TTFT=1974ms  prompt_tokens=2663  cached_tokens=2560 [CACHE HIT: 2560 tokens]  completion_tokens=51
[01:30:38.632] DEBUG (4000): Task.runTask: task performTextForwarding done
[01:30:38.632] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:30:38.633] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:30:38.633] DEBUG (4000): Task.runTask: task performLLMInference done
[01:30:38.634] DEBUG (4000): Task.runTask: task inference-tts-input done
[01:30:38.634] DEBUG (4000): Task.runTask: task inference-tts-sentence done
[01:30:39.267] DEBUG (4000): Task.runTask: task inference-tts-recv done
[01:30:39.268] DEBUG (4000): Task.runTask: task inference-tts-ws-listener done
[01:30:39.269] DEBUG (4000): Task.runTask: task performTTSInference done
[01:30:39.287] DEBUG (4000): Task.runTask: task performAudioForwarding done
[agent-debug]: Agent state: thinking → speaking

[pipeline][20:30:41.690] ── TURN 31 METRICS SUMMARY ──        
  • STT Processing: ?
  • EOU Delay (User End → LLM Start): 9ms
  • LLM TTFT (LLM Start → First Token): 1117ms
  • LLM Total (LLM Start → Complete): 24371ms
  • TTS TTFB (TTS Start → First Audio Byte): 355ms
  • TTS Total (TTS Start → Complete): 888ms
  • LemonSlice Render & Network (TTS TTFB → Avatar Frame): 1957ms
  • E2E Latency (User End → Avatar Frame): 26442ms
───────────────────────────────────────────────────
[01:30:45.060] INFO (4000): playback finished event received
    callerIdentity: "lemonslice-avatar-agent"
[agent-debug]: Agent state: speaking → listening
[01:30:45.065] INFO (4000): playout completed without interruption
    speech_id: "speech_9877270f-ebb"
    message: "<expr type=\"expression\" label=\"apologetic\"/> I'm sorry, I'm having trouble accessing the calendar. <expr type=\"break\" label=\"300ms\"/> Could you please try another date?"
[01:30:45.066] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
[01:30:51.802] DEBUG (4000): VAD task: START_OF_SPEECH
[01:30:52.846] DEBUG (4000): interim transcript
    transcript: "Sure"
[01:30:53.226] DEBUG (4000): interim transcript
    transcript: "Sure, let"
[01:30:53.245] DEBUG (4000): interim transcript
    transcript: "Sure, let's"
[01:30:53.664] DEBUG (4000): interim transcript
    transcript: "Sure, let's do"
[01:30:53.859] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on"
[01:30:55.237] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday"
[01:30:56.060] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh"
[01:30:56.451] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh around"
[01:30:56.853] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh around 3"        
[01:30:57.247] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh around 3 in"     
[01:30:57.642] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh around 3 in the" 
[01:30:57.660] DEBUG (4000): interim transcript
    transcript: "Sure, let's do on Friday uh around 3 in the afternoon."
[01:30:57.664] DEBUG (4000): received user preflight transcript
    user_transcript: "Sure, let's do on Friday uh around 3 in 
the afternoon."
    language: "en"
[01:30:57.664] DEBUG (4000): triggering preemptive generation 
(PREFLIGHT_TRANSCRIPT)
    transcript: "Sure, let's do on Friday uh around 3 in the afternoon."
[01:30:57.948] DEBUG (4000): VAD task: END_OF_SPEECH
[agent-hook]: Transient noise detected (no words produced). Duration: 0ms.
[01:30:57.949] DEBUG (4000): running EOU detection
    audioTranscript: ""
[01:30:57.950] DEBUG (4000): skipping EOU detection
[pipeline][20:30:58.064] STT final transcript: "Sure, let's do on Friday uh around 3 in the afternoon."
[pipeline][20:30:58.064] STT complete (?): "Sure, let's do on 
Friday uh around 3 in the afternoon."
[01:30:58.065] DEBUG (4000): received user transcript
    user_transcript: "Sure, let's do on Friday uh around 3 in 
the afternoon."
    language: "en"
[agent-hook]: onUserTurnCompleted hook triggered with message: "Sure, let's do on Friday uh around 3 in the afternoon."     
[voice-scheduling]: scheduling prompt retained; mortgage stage extraction bypassed for "Sure, let's do on Friday uh around 3 in the afternoon.".
[agent-debug]: Agent state: listening → thinking
[01:30:58.066] DEBUG (4000): running EOU detection on stt FINAL_TRANSCRIPT
[01:30:58.066] DEBUG (4000): running EOU detection
    audioTranscript: "Sure, let's do on Friday uh around 3 in 
the afternoon."
[01:30:58.067] DEBUG (4000): Running turn detector model      
[01:30:58.068] DEBUG (4000): eot prediction
    endOfTurnProbability: 0.9413723945617676
    unlikelyThreshold: 0.3857
    endpointingDelay: 100
    language: "en"
    trigger: "stt"
    fromCache: true
[01:30:58.069] DEBUG (4000): end of user turn
    transcript: "Sure, let's do on Friday uh around 3 in the afternoon."
[01:30:58.070] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted started
[01:30:58.073] INFO (4000): Creating speech handle
    speech_id: "speech_ee008fbe-642"
[01:30:58.073] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:30:58.074] DEBUG (4000): Task.runTask: task performLLMInference started
[01:30:58.077] DEBUG (4000): EOU detection task completed     
[01:30:58.078] DEBUG (4000): Task.runTask: task AgentActivity.userTurnCompleted done
[01:30:58.080] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:30:58.082] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:30:59.639] INFO (4000): Executing LLM tool call
    function: "findMeetingTimes"
    arguments: {
      "requestedDate": "2026-11-14",
      "customerTimeZone": "America/Chicago"
    }
    speech_id: "speech_ee008fbe-642"
[pipeline][20:30:59.643] LLM metrics — TTFT=1562ms  prompt_tokens=2739  cached_tokens=64 [CACHE HIT: 64 tokens]  completion_tokens=34
[01:30:59.639] DEBUG (4000): Task.runTask: task performToolExecution:findMeetingTimes started
[01:30:59.647] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:30:59.647] DEBUG (4000): Task.runTask: task performLLMInference done
[01:31:20.650] ERROR (4000): exception occurred while executing tool
    function: "findMeetingTimes"
    speech_id: "speech_ee008fbe-642"
    error: "connect ETIMEDOUT 192.168.10.10:5432"
[01:31:20.650] DEBUG (4000): Task.runTask: task performToolExecution:findMeetingTimes done
[01:31:20.650] DEBUG (4000): tools execution completed        
    speech_id: "speech_ee008fbe-642"
[01:31:20.651] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:31:20.652] DEBUG (findMeetingTimes/4000): Tool call execution finished
    speechId: "speech_ee008fbe-642"
    args: "{\"customerTimeZone\":\"America/Chicago\",\"requestedDate\":\"2026-11-14\"}"
    output: "An internal error occurred"
    isError: true
[01:31:20.653] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply started
[01:31:20.655] DEBUG (4000): Task.runTask: task performLLMInference started
[01:31:20.656] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments started
[01:31:20.656] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
[01:31:20.657] DEBUG (4000): Task.runTask: task performToolExecutions started
[01:31:22.393] DEBUG (4000): Task.runTask: task performTTSInference started
[01:31:22.394] DEBUG (4000): Task.runTask: task performTextForwarding started
[01:31:22.394] DEBUG (4000): Task.runTask: task performAudioForwarding started
[01:31:22.396] DEBUG (4000): Task.runTask: task inference-tts-input started
[01:31:22.396] DEBUG (4000): Task.runTask: task inference-tts-sentence started
[01:31:22.396] DEBUG (4000): Task.runTask: task inference-tts-ws-listener started
[01:31:22.396] DEBUG (4000): Task.runTask: task inference-tts-recv started
[pipeline][20:31:22.592] LLM metrics — TTFT=1736ms  prompt_tokens=2785  cached_tokens=2688 [CACHE HIT: 2688 tokens]  completion_tokens=48
[01:31:22.594] DEBUG (4000): Task.runTask: task performToolExecutions done
[01:31:22.595] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply.produceSegments done
[01:31:22.595] DEBUG (4000): Task.runTask: task performLLMInference done
[01:31:22.596] DEBUG (4000): Task.runTask: task inference-tts-input done
[01:31:22.596] DEBUG (4000): Task.runTask: task inference-tts-sentence done
[01:31:22.602] DEBUG (4000): Task.runTask: task performTextForwarding done
[01:31:23.196] DEBUG (4000): Task.runTask: task inference-tts-recv done
[01:31:23.197] DEBUG (4000): Task.runTask: task inference-tts-ws-listener done
[01:31:23.198] DEBUG (4000): Task.runTask: task performTTSInference done
[01:31:23.262] DEBUG (4000): Task.runTask: task performAudioForwarding done
[agent-debug]: Agent state: thinking → speaking

[pipeline][20:31:25.710] ── TURN 32 METRICS SUMMARY ──        
  • STT Processing: ?
  • EOU Delay (User End → LLM Start): 11ms
  • LLM TTFT (LLM Start → First Token): 1562ms
  • LLM Total (LLM Start → Complete): 24516ms
  • TTS TTFB (TTS Start → First Audio Byte): 358ms
  • TTS Total (TTS Start → Complete): 801ms
  • LemonSlice Render & Network (TTS TTFB → Avatar Frame): 1941ms
  • E2E Latency (User End → Avatar Frame): 26627ms
───────────────────────────────────────────────────
[01:31:28.091] INFO (4000): playback finished event received
    callerIdentity: "lemonslice-avatar-agent"
[agent-debug]: Agent state: speaking → listening
[01:31:28.097] INFO (4000): playout completed without interruption
    speech_id: "speech_ee008fbe-642"
    message: "<expr type=\"expression\" label=\"apologetic\"/> I'm still having trouble with the calendar. <expr type=\"break\" label=\"300ms\"/> Could you tell me your time zone?"      
[01:31:28.101] DEBUG (4000): Task.runTask: task AgentActivity.pipelineReply done
