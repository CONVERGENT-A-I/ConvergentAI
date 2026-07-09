DEFAULT 2026-07-08T13:33:24.182384259Z [resource.labels.instanceId: convergent-ai] [13:33:24.181] [34mDEBUG[39m (61): [36mJob process shutdown[39m
DEFAULT 2026-07-08T13:33:24.182494682Z [resource.labels.instanceId: convergent-ai] jobID: "AJ_KMNafmq7buhy"
DEFAULT 2026-07-08T13:34:02.052999690Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:34:01.921249+00:00 convergent-ai CRON[49137]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:34:02.053004756Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:34:01.923332+00:00 convergent-ai CRON[49136]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:34:57.744308172Z [resource.labels.instanceId: convergent-ai] [server]: Requesting Keyframe session for persona: public:lyra_persona-1.5-live
DEFAULT 2026-07-08T13:35:00.527563655Z [resource.labels.instanceId: convergent-ai] [server]: Keyframe session created successfully.
DEFAULT 2026-07-08T13:35:02.044609565Z [resource.labels.instanceId: convergent-ai] [13:35:02.043] [32mINFO[39m (18): [36mreceived job request[39m
DEFAULT 2026-07-08T13:35:02.044740566Z [resource.labels.instanceId: convergent-ai] version: "1.4.7"
DEFAULT 2026-07-08T13:35:02.044792155Z [resource.labels.instanceId: convergent-ai] jobId: "AJ_ZUttnDSBHMRJ"
DEFAULT 2026-07-08T13:35:02.044828194Z [resource.labels.instanceId: convergent-ai] resuming: false
DEFAULT 2026-07-08T13:35:02.044867166Z [resource.labels.instanceId: convergent-ai] agentName: ""
DEFAULT 2026-07-08T13:35:02.053054571Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:35:01.928519+00:00 convergent-ai CRON[49140]: (root) CMD (command -v debian-sa1 > /dev/null && debian-sa1 1 1)
DEFAULT 2026-07-08T13:35:02.053056122Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:35:01.928799+00:00 convergent-ai CRON[49141]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:35:02.053056478Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:35:01.930676+00:00 convergent-ai CRON[49139]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:35:03.850668727Z [resource.labels.instanceId: convergent-ai] ◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }
DEFAULT 2026-07-08T13:35:03.861105013Z [resource.labels.instanceId: convergent-ai] [13:35:03.856] [34mDEBUG[39m (102): [36minitializing job runner[39m
DEFAULT 2026-07-08T13:35:03.863683608Z [resource.labels.instanceId: convergent-ai] [13:35:03.861] [34mDEBUG[39m (102): [36mjob runner initialized[39m
DEFAULT 2026-07-08T13:35:03.867480972Z [resource.labels.instanceId: convergent-ai] [13:35:03.866] [34mDEBUG[39m (102): [36mjob started[39m
DEFAULT 2026-07-08T13:35:03.867594333Z [resource.labels.instanceId: convergent-ai] jobID: "AJ_ZUttnDSBHMRJ"
DEFAULT 2026-07-08T13:35:03.868762354Z [resource.labels.instanceId: convergent-ai] [agent]: Receiving job for room: undefined
DEFAULT 2026-07-08T13:35:03.869306227Z [resource.labels.instanceId: convergent-ai] [agent]: Loading VAD (minSilence=350ms)...
DEFAULT 2026-07-08T13:35:03.869598153Z [resource.labels.instanceId: convergent-ai] [agent]: Loading Cartesia STT/TTS (ink-2 / sonic-3.5)...
DEFAULT 2026-07-08T13:35:03.870157386Z [resource.labels.instanceId: convergent-ai] [agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT/TTS)...
DEFAULT 2026-07-08T13:35:03.871524118Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"prompt_size","label":"voice_static","estimatedTokens":2103,"contextLimit":32000,"pctOfLimit":"6.6%","forceCompactThreshold":6000}
DEFAULT 2026-07-08T13:35:03.871629205Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"prompt_size","label":"text_full","estimatedTokens":2103,"contextLimit":32000,"pctOfLimit":"6.6%","forceCompactThreshold":6000}
DEFAULT 2026-07-08T13:35:04.176958036Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783517704176,"pid":102,"hostname":"0f3ebb9fead1","name":"lk-rtc","msg":"Connect callback received"}
DEFAULT 2026-07-08T13:35:04.177913930Z [resource.labels.instanceId: convergent-ai] [agent]: Connected to room: room-vfzn2g5d5
DEFAULT 2026-07-08T13:35:04.200792739Z [resource.labels.instanceId: convergent-ai] [agent]: Ready — model=cascade-livekit-inference (Cerebras GPT-OSS 120B + Cartesia), prompt=mvp-1, compact@6 turns / 6000 tokens
DEFAULT 2026-07-08T13:35:04.629889137Z [resource.labels.instanceId: convergent-ai] [latency-check][13:35:04.629] Cerebras API connection roundtrip test completed in 452ms (HTTP Status: 200)
DEFAULT 2026-07-08T13:35:05.009936427Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:35:05.011216732Z [resource.labels.instanceId: convergent-ai] [13:35:05.010] [34mDEBUG[39m (102): [36mConfiguring session recording (cloud tracer)[39m
DEFAULT 2026-07-08T13:35:05.011338381Z [resource.labels.instanceId: convergent-ai] jobId: "AJ_ZUttnDSBHMRJ"
DEFAULT 2026-07-08T13:35:05.011376372Z [resource.labels.instanceId: convergent-ai] roomName: "room-vfzn2g5d5"
DEFAULT 2026-07-08T13:35:05.031980670Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":0,"sessionAgeMs":1163,"contextItemCount":1,"estimatedContextTokens":0}
DEFAULT 2026-07-08T13:35:05.065842082Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: initializing → listening
DEFAULT 2026-07-08T13:35:05.068182121Z [resource.labels.instanceId: convergent-ai] [agent]: Session started on SYSTEM_CHANNEL_START.
DEFAULT 2026-07-08T13:35:05.074146865Z [resource.labels.instanceId: convergent-ai] [agent]: Sent SYSTEM_AGENT_READY signal.
DEFAULT 2026-07-08T13:35:05.077600265Z [resource.labels.instanceId: convergent-ai] [agent]: Greeting fired.
DEFAULT 2026-07-08T13:35:05.107967027Z [resource.labels.instanceId: convergent-ai] [13:35:05.020] [33mWARN[39m (102): [36mtext stream handler for topic "lk.chat" already set, ignoring[39m
DEFAULT 2026-07-08T13:35:05.108086462Z [resource.labels.instanceId: convergent-ai] [13:35:05.025] [34mDEBUG[39m (102): [36mconnection state changed[39m
DEFAULT 2026-07-08T13:35:05.108120695Z [resource.labels.instanceId: convergent-ai] state: 1
DEFAULT 2026-07-08T13:35:05.108156120Z [resource.labels.instanceId: convergent-ai] [13:35:05.027] [33mWARN[39m (102): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-08T13:35:05.108188640Z [resource.labels.instanceId: convergent-ai] [13:35:05.028] [33mWARN[39m (102): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-08T13:35:05.108225855Z [resource.labels.instanceId: convergent-ai] [13:35:05.029] [34mDEBUG[39m (102): [36mTask.runTask: task recorder_io_encode_task started[39m
DEFAULT 2026-07-08T13:35:05.108264473Z [resource.labels.instanceId: convergent-ai] [13:35:05.036] [34mDEBUG[39m (102): [36mAgent handoff inserted into chat context[39m
DEFAULT 2026-07-08T13:35:05.108297888Z [resource.labels.instanceId: convergent-ai] newAgentId: "ailana_voice_agent"
DEFAULT 2026-07-08T13:35:05.108336121Z [resource.labels.instanceId: convergent-ai] [13:35:05.048] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onEnter started[39m
DEFAULT 2026-07-08T13:35:05.108391102Z [resource.labels.instanceId: convergent-ai] [13:35:05.058] [34mDEBUG[39m (102): [36msetting participant[39m
DEFAULT 2026-07-08T13:35:05.108422360Z [resource.labels.instanceId: convergent-ai] participantIdentity: "guest_1839"
DEFAULT 2026-07-08T13:35:05.108453956Z [resource.labels.instanceId: convergent-ai] [13:35:05.059] [34mDEBUG[39m (102): [36msetting participant audio input[39m
DEFAULT 2026-07-08T13:35:05.108512453Z [resource.labels.instanceId: convergent-ai] participant: "guest_1839"
DEFAULT 2026-07-08T13:35:05.108544761Z [resource.labels.instanceId: convergent-ai] [13:35:05.060] [32mINFO[39m (102): [36mparticipantValue.trackPublications[39m
DEFAULT 2026-07-08T13:35:05.108571840Z [resource.labels.instanceId: convergent-ai] participantValue: "guest_1839"
DEFAULT 2026-07-08T13:35:05.108612201Z [resource.labels.instanceId: convergent-ai] trackPublications: []
DEFAULT 2026-07-08T13:35:05.108744036Z [resource.labels.instanceId: convergent-ai] lengthOfTrackPublications: 0
DEFAULT 2026-07-08T13:35:05.108824938Z [resource.labels.instanceId: convergent-ai] [13:35:05.063] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onEnter done[39m
DEFAULT 2026-07-08T13:35:05.108859213Z [resource.labels.instanceId: convergent-ai] [13:35:05.064] [34mDEBUG[39m (102): [36musing audio io: `RecorderAudioInput` -> `AgentSession` -> `RecorderAudioOutput`[39m
DEFAULT 2026-07-08T13:35:05.108898767Z [resource.labels.instanceId: convergent-ai] [13:35:05.065] [34mDEBUG[39m (102): [36musing transcript io: `AgentSession` -> `SyncedTextOutput`[39m
DEFAULT 2026-07-08T13:35:05.108939945Z [resource.labels.instanceId: convergent-ai] [13:35:05.074] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.tts_say started[39m
DEFAULT 2026-07-08T13:35:05.108976502Z [resource.labels.instanceId: convergent-ai] [13:35:05.077] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:35:05.109005481Z [resource.labels.instanceId: convergent-ai] [13:35:05.079] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:35:05.109051683Z [resource.labels.instanceId: convergent-ai] [13:35:05.082] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:35:05.109085203Z [resource.labels.instanceId: convergent-ai] [13:35:05.087] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:35:05.109116830Z [resource.labels.instanceId: convergent-ai] [13:35:05.098] [34mDEBUG[39m (102): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-08T13:35:05.535905418Z [resource.labels.instanceId: convergent-ai] [13:35:05.535] [34mDEBUG[39m (102): [36maec warmup active, disabling interruptions[39m
DEFAULT 2026-07-08T13:35:05.536036133Z [resource.labels.instanceId: convergent-ai] warmupDurationMs: 3000
DEFAULT 2026-07-08T13:35:05.536072099Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → speaking
DEFAULT 2026-07-08T13:35:06.409284764Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:35:07.240859962Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:07.240] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:35:07.240985652Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:07.240] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:35:07.244275637Z [resource.labels.instanceId: convergent-ai] [13:35:07.243] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:35:08.535165525Z [resource.labels.instanceId: convergent-ai] [13:35:08.534] [34mDEBUG[39m (102): [36maec warmup expired, re-enabling interruptions[39m
DEFAULT 2026-07-08T13:35:08.908184204Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:35:16.604632018Z [resource.labels.instanceId: convergent-ai] [13:35:16.604] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:35:17.628178109Z [resource.labels.instanceId: convergent-ai] [13:35:17.627] [33mWARN[39m (102): [36mInput is shorter by 578784 samples; silence has been prepended to align the input channel.[39m
DEFAULT 2026-07-08T13:35:17.640194635Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":1,"sessionAgeMs":13771,"contextItemCount":2,"estimatedContextTokens":55}
DEFAULT 2026-07-08T13:35:17.641889797Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:35:17.643846681Z [resource.labels.instanceId: convergent-ai] [13:35:17.643] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.tts_say done[39m
DEFAULT 2026-07-08T13:35:20.033053386Z [resource.labels.instanceId: convergent-ai] [13:35:20.031] [33mWARN[39m (102): [36minput speech hasn't started yet, skipping silence padding, recording may be inaccurate until the speech starts[39m
DEFAULT 2026-07-08T13:35:22.533377811Z [resource.labels.instanceId: convergent-ai] [13:35:22.532] [33mWARN[39m (102): [36minput speech hasn't started yet, skipping silence padding, recording may be inaccurate until the speech starts[39m
DEFAULT 2026-07-08T13:35:23.611678933Z [resource.labels.instanceId: convergent-ai] [13:35:23.610] [34mDEBUG[39m (102): [36monTrackSubscribed in _input[39m
DEFAULT 2026-07-08T13:35:23.611865158Z [resource.labels.instanceId: convergent-ai] participant: "guest_1839"
DEFAULT 2026-07-08T13:35:24.510095038Z [resource.labels.instanceId: convergent-ai] [13:35:24.509] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:24.851662380Z [resource.labels.instanceId: convergent-ai] [13:35:24.851] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:25.034592743Z [resource.labels.instanceId: convergent-ai] [13:35:25.033] [33mWARN[39m (102): [36minput speech started after last agent speech ended[39m
DEFAULT 2026-07-08T13:35:25.034708482Z [resource.labels.instanceId: convergent-ai] lastAgentSpeechTime: 1783517717597
DEFAULT 2026-07-08T13:35:25.034738736Z [resource.labels.instanceId: convergent-ai] inputStartedTime: 1783517723619
DEFAULT 2026-07-08T13:35:25.469021848Z [resource.labels.instanceId: convergent-ai] [13:35:25.468] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:25.469150768Z [resource.labels.instanceId: convergent-ai] transcript: "Hello"
DEFAULT 2026-07-08T13:35:25.963200079Z [resource.labels.instanceId: convergent-ai] [13:35:25.962] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:25.963335321Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Al"
DEFAULT 2026-07-08T13:35:25.984653110Z [resource.labels.instanceId: convergent-ai] [13:35:25.984] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:25.984783342Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how"
DEFAULT 2026-07-08T13:35:26.004673861Z [resource.labels.instanceId: convergent-ai] [13:35:26.003] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:26.004814956Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.026151455Z [resource.labels.instanceId: convergent-ai] [13:35:26.025] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:35:26.026267774Z [resource.labels.instanceId: convergent-ai] user_transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.026317672Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:35:26.027539118Z [resource.labels.instanceId: convergent-ai] [13:35:26.026] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:35:26.027649503Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.127348124Z [resource.labels.instanceId: convergent-ai] [13:35:26.126] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:26.129389596Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:26.129] STT final transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.129526197Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:26.129] STT complete (-1ms): "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.136658114Z [resource.labels.instanceId: convergent-ai] [13:35:26.130] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:35:26.136769092Z [resource.labels.instanceId: convergent-ai] user_transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.136801945Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:35:26.136831503Z [resource.labels.instanceId: convergent-ai] [13:35:26.132] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:35:26.136867159Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517724444.1401
DEFAULT 2026-07-08T13:35:26.136906163Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:35:26.136955030Z [resource.labels.instanceId: convergent-ai] [13:35:26.132] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:26.137008498Z [resource.labels.instanceId: convergent-ai] [13:35:26.133] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:35:26.137070423Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.137116138Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:35:26.170258536Z [resource.labels.instanceId: convergent-ai] [13:35:26.169] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:35:26.170390840Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.171577749Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Hello Alana, how are you?"
DEFAULT 2026-07-08T13:35:26.172210885Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:35:26.172477183Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:35:26.172567410Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=borrower_name
DEFAULT 2026-07-08T13:35:26.172679053Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.4ms
DEFAULT 2026-07-08T13:35:26.172737654Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:35:26.172782294Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:35:26.172828672Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 1.3ms
DEFAULT 2026-07-08T13:35:26.172870184Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:35:26.178653439Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 5.7ms (corrected=false)
DEFAULT 2026-07-08T13:35:26.178785807Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "borrower_name" is 1
DEFAULT 2026-07-08T13:35:26.179367876Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:35:26.183229732Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":22314,"contextItemCount":3,"estimatedContextTokens":61,"userTurnEndAt":1783517726129}
DEFAULT 2026-07-08T13:35:26.184655576Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:35:26.191565952Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:26.191] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:35:26.195997226Z [resource.labels.instanceId: convergent-ai] [13:35:26.170] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:35:26.196113178Z [resource.labels.instanceId: convergent-ai] [13:35:26.173] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:35:26.196151509Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_a1093d9f-9af"
DEFAULT 2026-07-08T13:35:26.196180860Z [resource.labels.instanceId: convergent-ai] [13:35:26.173] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:35:26.196216454Z [resource.labels.instanceId: convergent-ai] [13:35:26.175] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:35:26.196247726Z [resource.labels.instanceId: convergent-ai] [13:35:26.180] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:35:26.196292623Z [resource.labels.instanceId: convergent-ai] [13:35:26.180] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:35:26.196335338Z [resource.labels.instanceId: convergent-ai] [13:35:26.184] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:35:26.196362933Z [resource.labels.instanceId: convergent-ai] [13:35:26.188] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:35:26.349070650Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:26.348] First chunk/token received (TTFT: 157ms)
DEFAULT 2026-07-08T13:35:26.364155221Z [resource.labels.instanceId: convergent-ai] [13:35:26.363] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:35:26.369671970Z [resource.labels.instanceId: convergent-ai] [13:35:26.365] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:35:26.369786998Z [resource.labels.instanceId: convergent-ai] [13:35:26.365] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:35:26.369826261Z [resource.labels.instanceId: convergent-ai] [13:35:26.365] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:35:26.385239924Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:26.385] Stream complete (Total: 194ms, chunks: 8)
DEFAULT 2026-07-08T13:35:26.385910907Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:26.385] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:35:26.385987358Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:26.385] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:35:26.386151660Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":22518,"contextItemCount":0,"estimatedContextTokens":1876,"ttftMs":185,"userTurnEndAt":1783517726129}
DEFAULT 2026-07-08T13:35:26.386231794Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:26.386] LLM metrics — TTFT=185ms prompt_tokens=1876 completion_tokens=27
DEFAULT 2026-07-08T13:35:26.388842645Z [resource.labels.instanceId: convergent-ai] [13:35:26.388] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:35:26.390163832Z [resource.labels.instanceId: convergent-ai] [13:35:26.388] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:35:26.390247589Z [resource.labels.instanceId: convergent-ai] [13:35:26.389] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:35:26.641698718Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 462.2ms
DEFAULT 2026-07-08T13:35:26.642051174Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:35:26.642147496Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 462.8ms (content=ok)
DEFAULT 2026-07-08T13:35:26.642258937Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 463.6ms
DEFAULT 2026-07-08T13:35:26.642330642Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 470.2ms
DEFAULT 2026-07-08T13:35:26.642365732Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 1 extraction finished in 470.4ms.
DEFAULT 2026-07-08T13:35:26.642402300Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 1 background extraction results into state.
DEFAULT 2026-07-08T13:35:26.669521677Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:35:26.669647347Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":22801,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":540,"agentSpeakingAt":1783517726669,"userTurnEndAt":1783517726129}
DEFAULT 2026-07-08T13:35:27.550896220Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:27.550] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:35:27.551043338Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:27.550] ── TURN 2 SUMMARY ── stt_done=? llm_start=? llm_first_token=256ms llm_done=256ms tts_start=? tts_done=1421ms
DEFAULT 2026-07-08T13:35:27.551088048Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:27.550] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:35:27.553183660Z [resource.labels.instanceId: convergent-ai] [13:35:27.552] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:35:27.554197172Z [resource.labels.instanceId: convergent-ai] [13:35:27.553] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:35:33.600847450Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":29732,"contextItemCount":4,"estimatedContextTokens":88,"userTurnEndAt":1783517726129}
DEFAULT 2026-07-08T13:35:33.602132082Z [resource.labels.instanceId: convergent-ai] [13:35:33.601] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:35:33.602271392Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_a1093d9f-9af"
DEFAULT 2026-07-08T13:35:33.602309926Z [resource.labels.instanceId: convergent-ai] message: "I'm doing wonderful, thank you for asking! Before we dive into your questions, may I ask what your name is? "
DEFAULT 2026-07-08T13:35:33.602349150Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:35:33.603802377Z [resource.labels.instanceId: convergent-ai] [13:35:33.603] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:35:36.939679903Z [resource.labels.instanceId: convergent-ai] [13:35:36.938] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:37.163415713Z [resource.labels.instanceId: convergent-ai] [13:35:37.162] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:37.779523906Z [resource.labels.instanceId: convergent-ai] [13:35:37.778] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:37.779652825Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:35:38.109612503Z [resource.labels.instanceId: convergent-ai] [13:35:38.109] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:38.109730162Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah"
DEFAULT 2026-07-08T13:35:38.272715209Z [resource.labels.instanceId: convergent-ai] [13:35:38.272] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:38.272840658Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my"
DEFAULT 2026-07-08T13:35:38.608021781Z [resource.labels.instanceId: convergent-ai] [13:35:38.607] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:38.608146740Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my name"
DEFAULT 2026-07-08T13:35:38.626488918Z [resource.labels.instanceId: convergent-ai] [13:35:38.625] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:38.626613976Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.640089336Z [resource.labels.instanceId: convergent-ai] [13:35:38.639] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:38.647211139Z [resource.labels.instanceId: convergent-ai] [13:35:38.646] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:35:38.647334108Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.647374018Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:35:38.649554348Z [resource.labels.instanceId: convergent-ai] [13:35:38.647] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:35:38.649660209Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.896284315Z [resource.labels.instanceId: convergent-ai] [13:35:38.895] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:38.897749076Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:38.897] STT final transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.897857683Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:38.897] STT complete (-1ms): "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.900908755Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.901042611Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 1 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:35:38.901177947Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 1 extraction resolved normally. Waited: 0.3ms
DEFAULT 2026-07-08T13:35:38.901319576Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:35:38.901439621Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:35:38.901494509Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=borrower_name
DEFAULT 2026-07-08T13:35:38.901560119Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:35:38.901648486Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:35:38.901709897Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:35:38.901739349Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:35:38.901961600Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:35:38.904492868Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:35:38.904587287Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "borrower_name" is 2
DEFAULT 2026-07-08T13:35:38.904673618Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:35:38.905867195Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":35037,"contextItemCount":5,"estimatedContextTokens":95,"userTurnEndAt":1783517738897}
DEFAULT 2026-07-08T13:35:38.906737520Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:35:38.910931291Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:38.910] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:35:38.913678664Z [resource.labels.instanceId: convergent-ai] [13:35:38.898] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:35:38.913782150Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.913823881Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:35:38.913862790Z [resource.labels.instanceId: convergent-ai] [13:35:38.899] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:38.913897577Z [resource.labels.instanceId: convergent-ai] [13:35:38.899] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:35:38.913926300Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.913960496Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:35:38.913990778Z [resource.labels.instanceId: convergent-ai] [13:35:38.900] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:35:38.914025028Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my name is John."
DEFAULT 2026-07-08T13:35:38.914057378Z [resource.labels.instanceId: convergent-ai] [13:35:38.900] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:35:38.914098950Z [resource.labels.instanceId: convergent-ai] [13:35:38.901] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:35:38.914140468Z [resource.labels.instanceId: convergent-ai] [13:35:38.902] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:35:38.914180649Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8c91da2b-495"
DEFAULT 2026-07-08T13:35:38.914211234Z [resource.labels.instanceId: convergent-ai] [13:35:38.902] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:35:38.914242949Z [resource.labels.instanceId: convergent-ai] [13:35:38.902] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:35:38.914278279Z [resource.labels.instanceId: convergent-ai] [13:35:38.904] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:35:38.914370324Z [resource.labels.instanceId: convergent-ai] [13:35:38.906] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:35:38.914407585Z [resource.labels.instanceId: convergent-ai] [13:35:38.909] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:35:39.080513402Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:39.080] First chunk/token received (TTFT: 170ms)
DEFAULT 2026-07-08T13:35:39.177773173Z [resource.labels.instanceId: convergent-ai] [13:35:39.177] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:35:39.181662824Z [resource.labels.instanceId: convergent-ai] [13:35:39.178] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:35:39.181783161Z [resource.labels.instanceId: convergent-ai] [13:35:39.179] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:35:39.181838457Z [resource.labels.instanceId: convergent-ai] [13:35:39.179] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:35:39.220319334Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:39.220] Stream complete (Total: 310ms, chunks: 11)
DEFAULT 2026-07-08T13:35:39.220873757Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:39.220] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:35:39.220976147Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:39.220] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:35:39.221019631Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":35352,"contextItemCount":0,"estimatedContextTokens":1920,"ttftMs":273,"userTurnEndAt":1783517738897}
DEFAULT 2026-07-08T13:35:39.221065510Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:39.220] LLM metrics — TTFT=273ms prompt_tokens=1920 completion_tokens=50
DEFAULT 2026-07-08T13:35:39.222846235Z [resource.labels.instanceId: convergent-ai] [13:35:39.222] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:35:39.223644410Z [resource.labels.instanceId: convergent-ai] [13:35:39.222] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:35:39.223741162Z [resource.labels.instanceId: convergent-ai] [13:35:39.222] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:35:39.226423698Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 321.7ms
DEFAULT 2026-07-08T13:35:39.226536226Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:35:39.226571747Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 321.8ms (content=ok)
DEFAULT 2026-07-08T13:35:39.226861152Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 322.3ms
DEFAULT 2026-07-08T13:35:39.226920578Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 325.6ms
DEFAULT 2026-07-08T13:35:39.226963333Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 2 extraction finished in 325.6ms.
DEFAULT 2026-07-08T13:35:39.227000188Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 2 background extraction results into state.
DEFAULT 2026-07-08T13:35:39.227278131Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: borrower_name -> mortgage_goal
DEFAULT 2026-07-08T13:35:39.598489116Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:35:39.598629192Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":35730,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":701,"agentSpeakingAt":1783517739598,"userTurnEndAt":1783517738897}
DEFAULT 2026-07-08T13:35:41.077945042Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:41.077] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:35:41.078083427Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:41.077] ── TURN 3 SUMMARY ── stt_done=? llm_start=? llm_first_token=323ms llm_done=323ms tts_start=? tts_done=2180ms
DEFAULT 2026-07-08T13:35:41.078134207Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:41.077] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:35:41.079959836Z [resource.labels.instanceId: convergent-ai] [13:35:41.079] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:35:41.080613814Z [resource.labels.instanceId: convergent-ai] [13:35:41.079] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:35:49.624420133Z [resource.labels.instanceId: convergent-ai] [13:35:49.623] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:35:50.703025184Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":46833,"contextItemCount":6,"estimatedContextTokens":149,"userTurnEndAt":1783517738897}
DEFAULT 2026-07-08T13:35:50.704731560Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:35:50.706558936Z [resource.labels.instanceId: convergent-ai] [13:35:50.703] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:35:50.706712593Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8c91da2b-495"
DEFAULT 2026-07-08T13:35:50.706824616Z [resource.labels.instanceId: convergent-ai] message: "It's a pleasure to meet you, John! To make sure I provide the most helpful information, what is your main goal for your mortgage—are you looking to buy a new home, or are you interested in refinancing an existing loan? "
DEFAULT 2026-07-08T13:35:50.752603102Z [resource.labels.instanceId: convergent-ai] [13:35:50.705] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:35:53.839992089Z [resource.labels.instanceId: convergent-ai] [13:35:53.839] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:54.093845969Z [resource.labels.instanceId: convergent-ai] [13:35:54.093] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:54.760011454Z [resource.labels.instanceId: convergent-ai] [13:35:54.759] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:54.760136842Z [resource.labels.instanceId: convergent-ai] transcript: "I'"
DEFAULT 2026-07-08T13:35:54.780220051Z [resource.labels.instanceId: convergent-ai] [13:35:54.779] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:54.780344925Z [resource.labels.instanceId: convergent-ai] transcript: "I'm"
DEFAULT 2026-07-08T13:35:54.905115241Z [resource.labels.instanceId: convergent-ai] [13:35:54.904] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:54.905236158Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just"
DEFAULT 2026-07-08T13:35:55.077615842Z [resource.labels.instanceId: convergent-ai] [13:35:55.077] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:55.077748680Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking"
DEFAULT 2026-07-08T13:35:55.221193002Z [resource.labels.instanceId: convergent-ai] [13:35:55.220] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:55.221342202Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to"
DEFAULT 2026-07-08T13:35:55.368648061Z [resource.labels.instanceId: convergent-ai] [13:35:55.368] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:55.368781300Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy"
DEFAULT 2026-07-08T13:35:55.389538270Z [resource.labels.instanceId: convergent-ai] [13:35:55.389] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:55.389670011Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a new home"
DEFAULT 2026-07-08T13:35:55.409938057Z [resource.labels.instanceId: convergent-ai] [13:35:55.409] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:35:55.410067185Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.412816500Z [resource.labels.instanceId: convergent-ai] [13:35:55.411] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:35:55.412966404Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.413009315Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:35:55.413058007Z [resource.labels.instanceId: convergent-ai] [13:35:55.412] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:35:55.413091248Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.689052647Z [resource.labels.instanceId: convergent-ai] [13:35:55.688] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:55.699334004Z [resource.labels.instanceId: convergent-ai] [13:35:55.698] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:35:55.700678673Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:55.700] STT final transcript: "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.700814816Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:55.700] STT complete (-1ms): "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.703441910Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I'm just looking to buy a new home."
DEFAULT 2026-07-08T13:35:55.703624128Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 2 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:35:55.703676226Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 2 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:35:55.703715389Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:35:55.703763234Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:35:55.703830985Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=mortgage_goal
DEFAULT 2026-07-08T13:35:55.703970265Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:35:55.704015354Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:35:55.704062508Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:35:55.704100587Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.6ms
DEFAULT 2026-07-08T13:35:55.704406709Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:35:55.707056651Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.6ms (corrected=false)
DEFAULT 2026-07-08T13:35:55.707253562Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "mortgage_goal" is 1
DEFAULT 2026-07-08T13:35:55.707300019Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:35:55.708372126Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":51840,"contextItemCount":7,"estimatedContextTokens":158,"userTurnEndAt":1783517755700}
DEFAULT 2026-07-08T13:35:55.717813596Z [resource.labels.instanceId: convergent-ai] [13:35:55.704] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:35:55.717833171Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_948bbdea-a35"
DEFAULT 2026-07-08T13:35:55.717853131Z [resource.labels.instanceId: convergent-ai] [13:35:55.704] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:35:55.717902179Z [resource.labels.instanceId: convergent-ai] [13:35:55.705] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:35:55.717928808Z [resource.labels.instanceId: convergent-ai] [13:35:55.707] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:35:55.717958391Z [resource.labels.instanceId: convergent-ai] [13:35:55.708] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:35:55.718007840Z [resource.labels.instanceId: convergent-ai] [13:35:55.711] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:35:55.897501747Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:55.897] First chunk/token received (TTFT: 182ms)
DEFAULT 2026-07-08T13:35:55.999505212Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 292.1ms
DEFAULT 2026-07-08T13:35:55.999659752Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:35:55.999705068Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 292.3ms (content=ok)
DEFAULT 2026-07-08T13:35:55.999742186Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 292.5ms
DEFAULT 2026-07-08T13:35:55.999770794Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 296.0ms
DEFAULT 2026-07-08T13:35:55.999824771Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 3 extraction finished in 296.1ms.
DEFAULT 2026-07-08T13:35:55.999846655Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 3 background extraction results into state.
DEFAULT 2026-07-08T13:35:55.999874758Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: mortgage_goal -> occupancy
DEFAULT 2026-07-08T13:35:56.076918113Z [resource.labels.instanceId: convergent-ai] [13:35:56.076] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:35:56.081040914Z [resource.labels.instanceId: convergent-ai] [13:35:56.078] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:35:56.081161486Z [resource.labels.instanceId: convergent-ai] [13:35:56.078] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:35:56.081212419Z [resource.labels.instanceId: convergent-ai] [13:35:56.078] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:35:56.131917626Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:35:56.131] Stream complete (Total: 416ms, chunks: 9)
DEFAULT 2026-07-08T13:35:56.132400757Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:56.132] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:35:56.132473161Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:56.132] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:35:56.132511305Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":52264,"contextItemCount":0,"estimatedContextTokens":1988,"ttftMs":369,"userTurnEndAt":1783517755700}
DEFAULT 2026-07-08T13:35:56.132542971Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:56.132] LLM metrics — TTFT=369ms prompt_tokens=1988 completion_tokens=32
DEFAULT 2026-07-08T13:35:56.134508280Z [resource.labels.instanceId: convergent-ai] [13:35:56.134] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:35:56.135516338Z [resource.labels.instanceId: convergent-ai] [13:35:56.134] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:35:56.135583735Z [resource.labels.instanceId: convergent-ai] [13:35:56.134] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:35:56.542881498Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:35:56.543003126Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":52674,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":842,"agentSpeakingAt":1783517756542,"userTurnEndAt":1783517755700}
DEFAULT 2026-07-08T13:35:57.522382091Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:57.522] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:35:57.522517178Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:57.522] ── TURN 4 SUMMARY ── stt_done=? llm_start=? llm_first_token=432ms llm_done=432ms tts_start=? tts_done=1822ms
DEFAULT 2026-07-08T13:35:57.522568794Z [resource.labels.instanceId: convergent-ai] [pipeline][13:35:57.522] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:35:57.524292582Z [resource.labels.instanceId: convergent-ai] [13:35:57.523] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:35:57.524945372Z [resource.labels.instanceId: convergent-ai] [13:35:57.524] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:36:02.052444958Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.942341+00:00 convergent-ai CRON[49187]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:36:02.052447020Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.943033+00:00 convergent-ai systemd[1]: Starting gce-workload-cert-refresh.service - GCE Workload Certificate refresh...
DEFAULT 2026-07-08T13:36:02.052447589Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944497+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052447961Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944637+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052448405Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944707+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052448781Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944761+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052449080Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944803+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052449371Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944838+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052449780Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944876+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052450308Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944917+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052450589Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944957+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052453077Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.944996+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052453516Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945036+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052453900Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945077+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052454260Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945124+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052454543Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945166+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052454906Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945212+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052455255Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945253+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052455511Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945291+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052456478Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945339+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052456910Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945379+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:36:02.052457239Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945427+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052457793Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.945483+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:36:31 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:36:02.052458030Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.946680+00:00 convergent-ai CRON[49185]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:36:02.052458391Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.956745+00:00 convergent-ai gce_workload_cert_refresh[49188]: 2026/07/08 13:36:01: Done
DEFAULT 2026-07-08T13:36:02.052458671Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.958894+00:00 convergent-ai systemd[1]: gce-workload-cert-refresh.service: Deactivated successfully.
DEFAULT 2026-07-08T13:36:02.052458917Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:36:01.959147+00:00 convergent-ai systemd[1]: Finished gce-workload-cert-refresh.service - GCE Workload Certificate refresh.
DEFAULT 2026-07-08T13:36:02.893795903Z [resource.labels.instanceId: convergent-ai] [13:36:02.893] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:36:03.935744282Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":60067,"contextItemCount":8,"estimatedContextTokens":195,"userTurnEndAt":1783517755700}
DEFAULT 2026-07-08T13:36:03.937233053Z [resource.labels.instanceId: convergent-ai] [13:36:03.936] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:36:03.937338879Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_948bbdea-a35"
DEFAULT 2026-07-08T13:36:03.937373773Z [resource.labels.instanceId: convergent-ai] message: "That's an exciting milestone! Will this new home be your primary residence, or are you looking at it as a vacation home or an investment property? "
DEFAULT 2026-07-08T13:36:03.937409730Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:36:03.938830939Z [resource.labels.instanceId: convergent-ai] [13:36:03.938] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:36:07.690174435Z [resource.labels.instanceId: convergent-ai] [13:36:07.689] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:07.862842426Z [resource.labels.instanceId: convergent-ai] [13:36:07.862] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:08.513049139Z [resource.labels.instanceId: convergent-ai] [13:36:08.512] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:08.513174637Z [resource.labels.instanceId: convergent-ai] transcript: "I'"
DEFAULT 2026-07-08T13:36:08.533632145Z [resource.labels.instanceId: convergent-ai] [13:36:08.533] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:08.533765548Z [resource.labels.instanceId: convergent-ai] transcript: "I'm"
DEFAULT 2026-07-08T13:36:08.846036932Z [resource.labels.instanceId: convergent-ai] [13:36:08.845] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:08.846192909Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking"
DEFAULT 2026-07-08T13:36:08.909697344Z [resource.labels.instanceId: convergent-ai] [13:36:08.909] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:09.129445009Z [resource.labels.instanceId: convergent-ai] [13:36:09.128] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:09.138515158Z [resource.labels.instanceId: convergent-ai] [13:36:09.138] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:09.138657832Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as"
DEFAULT 2026-07-08T13:36:09.304824749Z [resource.labels.instanceId: convergent-ai] [13:36:09.304] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:09.304948297Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it"
DEFAULT 2026-07-08T13:36:09.949902822Z [resource.labels.instanceId: convergent-ai] [13:36:09.949] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:09.950032663Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on"
DEFAULT 2026-07-08T13:36:10.281971630Z [resource.labels.instanceId: convergent-ai] [13:36:10.281] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:10.282091291Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it"
DEFAULT 2026-07-08T13:36:10.577852770Z [resource.labels.instanceId: convergent-ai] [13:36:10.577] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:10.577962621Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it as"
DEFAULT 2026-07-08T13:36:10.748047191Z [resource.labels.instanceId: convergent-ai] [13:36:10.747] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:10.748156949Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it as my"
DEFAULT 2026-07-08T13:36:11.225233394Z [resource.labels.instanceId: convergent-ai] [13:36:11.224] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:11.225359915Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it as my primary"
DEFAULT 2026-07-08T13:36:11.246397086Z [resource.labels.instanceId: convergent-ai] [13:36:11.245] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:11.246539311Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it as my primary residence."
DEFAULT 2026-07-08T13:36:11.248799212Z [resource.labels.instanceId: convergent-ai] [13:36:11.247] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:36:11.248918699Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm looking as it on it as my primary residence."
DEFAULT 2026-07-08T13:36:11.248957661Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:11.248986029Z [resource.labels.instanceId: convergent-ai] [13:36:11.248] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:36:11.249019980Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking as it on it as my primary residence."
DEFAULT 2026-07-08T13:36:11.393841465Z [resource.labels.instanceId: convergent-ai] [13:36:11.393] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:11.395384152Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:11.395] STT final transcript: "I'm looking as it on it as my primary residence."
DEFAULT 2026-07-08T13:36:11.395513096Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:11.395] STT complete (-1ms): "I'm looking as it on it as my primary residence."
DEFAULT 2026-07-08T13:36:11.399774792Z [resource.labels.instanceId: convergent-ai] [13:36:11.395] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:36:11.440267136Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:36:11.440589193Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:36:11.440652388Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.4ms
DEFAULT 2026-07-08T13:36:11.440690435Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:36:11.440886938Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.9ms (handled=false)
DEFAULT 2026-07-08T13:36:11.443506509Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:36:11.443615860Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "occupancy" is 1
DEFAULT 2026-07-08T13:36:11.443703828Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:36:11.444844871Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":67576,"contextItemCount":9,"estimatedContextTokens":207,"userTurnEndAt":1783517771395}
DEFAULT 2026-07-08T13:36:11.445791735Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:36:11.449762016Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:11.449] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:36:11.451975846Z [resource.labels.instanceId: convergent-ai] [13:36:11.439] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:36:11.452077434Z [resource.labels.instanceId: convergent-ai] [13:36:11.440] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:36:11.452112551Z [resource.labels.instanceId: convergent-ai] [13:36:11.441] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:36:11.452142484Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_2c1c99a0-78a"
DEFAULT 2026-07-08T13:36:11.452178429Z [resource.labels.instanceId: convergent-ai] [13:36:11.441] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:36:11.452212534Z [resource.labels.instanceId: convergent-ai] [13:36:11.441] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:36:11.452247502Z [resource.labels.instanceId: convergent-ai] [13:36:11.443] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:36:11.452280817Z [resource.labels.instanceId: convergent-ai] [13:36:11.445] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:36:11.452313523Z [resource.labels.instanceId: convergent-ai] [13:36:11.448] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:36:11.627672361Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:11.627] First chunk/token received (TTFT: 178ms)
DEFAULT 2026-07-08T13:36:11.643682404Z [resource.labels.instanceId: convergent-ai] [13:36:11.643] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:36:11.649301233Z [resource.labels.instanceId: convergent-ai] [13:36:11.644] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:36:11.649420809Z [resource.labels.instanceId: convergent-ai] [13:36:11.645] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:36:11.649448659Z [resource.labels.instanceId: convergent-ai] [13:36:11.645] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:36:11.660800066Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:11.660] Stream complete (Total: 211ms, chunks: 7)
DEFAULT 2026-07-08T13:36:11.661319323Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:11.661] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:36:11.661422330Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:11.661] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:36:11.661448824Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":67793,"contextItemCount":0,"estimatedContextTokens":2038,"ttftMs":200,"userTurnEndAt":1783517771395}
DEFAULT 2026-07-08T13:36:11.661509987Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:11.661] LLM metrics — TTFT=200ms prompt_tokens=2038 completion_tokens=21
DEFAULT 2026-07-08T13:36:11.663203219Z [resource.labels.instanceId: convergent-ai] [13:36:11.662] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:36:11.664112831Z [resource.labels.instanceId: convergent-ai] [13:36:11.663] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:36:11.664203227Z [resource.labels.instanceId: convergent-ai] [13:36:11.663] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:36:11.764332623Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 320.4ms
DEFAULT 2026-07-08T13:36:11.764456581Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:36:11.764522981Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 320.6ms (content=ok)
DEFAULT 2026-07-08T13:36:11.764559987Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 320.7ms
DEFAULT 2026-07-08T13:36:11.764602883Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 324.5ms
DEFAULT 2026-07-08T13:36:11.764641017Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 4 extraction finished in 324.5ms.
DEFAULT 2026-07-08T13:36:11.764674470Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 4 background extraction results into state.
DEFAULT 2026-07-08T13:36:11.764705174Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: occupancy -> existing_relationship
DEFAULT 2026-07-08T13:36:12.006920567Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:36:12.007039329Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":68138,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":611,"agentSpeakingAt":1783517772006,"userTurnEndAt":1783517771395}
DEFAULT 2026-07-08T13:36:12.652856451Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:12.652] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:36:12.652989037Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:12.652] ── TURN 5 SUMMARY ── stt_done=? llm_start=? llm_first_token=266ms llm_done=266ms tts_start=? tts_done=1257ms
DEFAULT 2026-07-08T13:36:12.653022772Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:12.652] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:36:12.654626206Z [resource.labels.instanceId: convergent-ai] [13:36:12.654] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:36:12.655263870Z [resource.labels.instanceId: convergent-ai] [13:36:12.654] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:36:15.804001963Z [resource.labels.instanceId: convergent-ai] [13:36:15.803] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:36:16.829154728Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":72960,"contextItemCount":10,"estimatedContextTokens":232,"userTurnEndAt":1783517771395}
DEFAULT 2026-07-08T13:36:16.830821055Z [resource.labels.instanceId: convergent-ai] [13:36:16.830] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:36:16.830954176Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_2c1c99a0-78a"
DEFAULT 2026-07-08T13:36:16.831000065Z [resource.labels.instanceId: convergent-ai] message: "I've noted that. Do you already have a banking or loan relationship with your lending institution? "
DEFAULT 2026-07-08T13:36:16.831159533Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:36:16.832366766Z [resource.labels.instanceId: convergent-ai] [13:36:16.831] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:36:20.450371822Z [resource.labels.instanceId: convergent-ai] [13:36:20.449] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:20.657871305Z [resource.labels.instanceId: convergent-ai] [13:36:20.657] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:21.488155516Z [resource.labels.instanceId: convergent-ai] [13:36:21.487] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:21.488301078Z [resource.labels.instanceId: convergent-ai] transcript: "No,"
DEFAULT 2026-07-08T13:36:21.508166186Z [resource.labels.instanceId: convergent-ai] [13:36:21.507] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:21.508278272Z [resource.labels.instanceId: convergent-ai] transcript: "No, I"
DEFAULT 2026-07-08T13:36:21.780252587Z [resource.labels.instanceId: convergent-ai] [13:36:21.779] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:21.780385382Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don'"
DEFAULT 2026-07-08T13:36:21.801238939Z [resource.labels.instanceId: convergent-ai] [13:36:21.800] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:21.801345153Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't"
DEFAULT 2026-07-08T13:36:21.943044962Z [resource.labels.instanceId: convergent-ai] [13:36:21.942] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:21.943171557Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have"
DEFAULT 2026-07-08T13:36:22.110118865Z [resource.labels.instanceId: convergent-ai] [13:36:22.109] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:22.110259319Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any"
DEFAULT 2026-07-08T13:36:22.439334481Z [resource.labels.instanceId: convergent-ai] [13:36:22.438] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:22.439487551Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type"
DEFAULT 2026-07-08T13:36:22.587018732Z [resource.labels.instanceId: convergent-ai] [13:36:22.586] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:22.587150396Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of"
DEFAULT 2026-07-08T13:36:23.229713453Z [resource.labels.instanceId: convergent-ai] [13:36:23.229] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:23.229833690Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations"
DEFAULT 2026-07-08T13:36:23.562110066Z [resource.labels.instanceId: convergent-ai] [13:36:23.561] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:23.562239651Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh"
DEFAULT 2026-07-08T13:36:23.728459058Z [resource.labels.instanceId: convergent-ai] [13:36:23.727] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:23.728597113Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh,"
DEFAULT 2026-07-08T13:36:23.749447136Z [resource.labels.instanceId: convergent-ai] [13:36:23.748] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:23.749592859Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh, this is my"
DEFAULT 2026-07-08T13:36:23.770781137Z [resource.labels.instanceId: convergent-ai] [13:36:23.770] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:23.770923594Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.792334302Z [resource.labels.instanceId: convergent-ai] [13:36:23.791] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:36:23.792505622Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.792564306Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:23.794044620Z [resource.labels.instanceId: convergent-ai] [13:36:23.792] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:36:23.794224064Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.876823362Z [resource.labels.instanceId: convergent-ai] [13:36:23.876] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:23.878700014Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:23.878] STT final transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.878826312Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:23.878] STT complete (-1ms): "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.882757033Z [resource.labels.instanceId: convergent-ai] [13:36:23.878] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:36:23.882871369Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.882911105Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:23.882944530Z [resource.labels.instanceId: convergent-ai] [13:36:23.880] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:36:23.882979513Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517780385.4377
DEFAULT 2026-07-08T13:36:23.883015750Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:36:23.884063860Z [resource.labels.instanceId: convergent-ai] [13:36:23.880] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:23.884149204Z [resource.labels.instanceId: convergent-ai] [13:36:23.881] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:36:23.884840480Z [resource.labels.instanceId: convergent-ai] audioTranscript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:23.886508078Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:36:24.029482024Z [resource.labels.instanceId: convergent-ai] [13:36:24.028] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:36:24.029614467Z [resource.labels.instanceId: convergent-ai] transcript: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:24.030132455Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "No, I don't have any type of relations. Uh, this is my first time."
DEFAULT 2026-07-08T13:36:24.030211434Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 4 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:36:24.031003427Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:36:24.033429784Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.3ms (corrected=false)
DEFAULT 2026-07-08T13:36:24.033614624Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "existing_relationship" is 1
DEFAULT 2026-07-08T13:36:24.033679181Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:36:24.034847300Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":80166,"contextItemCount":11,"estimatedContextTokens":248,"userTurnEndAt":1783517783878}
DEFAULT 2026-07-08T13:36:24.035795015Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:36:24.039457587Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:24.039] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:36:24.041621108Z [resource.labels.instanceId: convergent-ai] [13:36:24.029] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:36:24.041724667Z [resource.labels.instanceId: convergent-ai] [13:36:24.030] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:36:24.041777884Z [resource.labels.instanceId: convergent-ai] [13:36:24.031] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:36:24.041818359Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_ffd916be-1b8"
DEFAULT 2026-07-08T13:36:24.041850739Z [resource.labels.instanceId: convergent-ai] [13:36:24.031] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:36:24.041890716Z [resource.labels.instanceId: convergent-ai] [13:36:24.031] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:36:24.041973816Z [resource.labels.instanceId: convergent-ai] [13:36:24.033] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:36:24.042067474Z [resource.labels.instanceId: convergent-ai] [13:36:24.035] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:36:24.042104335Z [resource.labels.instanceId: convergent-ai] [13:36:24.038] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:36:24.202090488Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:24.201] First chunk/token received (TTFT: 162ms)
DEFAULT 2026-07-08T13:36:24.226555603Z [resource.labels.instanceId: convergent-ai] [13:36:24.226] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:36:24.231304179Z [resource.labels.instanceId: convergent-ai] [13:36:24.227] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:36:24.231413510Z [resource.labels.instanceId: convergent-ai] [13:36:24.227] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:36:24.231455912Z [resource.labels.instanceId: convergent-ai] [13:36:24.227] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:36:24.324100138Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:24.323] Stream complete (Total: 284ms, chunks: 21)
DEFAULT 2026-07-08T13:36:24.324478826Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:24.324] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:36:24.324551469Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:24.324] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:36:24.324588227Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":80456,"contextItemCount":0,"estimatedContextTokens":2088,"ttftMs":192,"userTurnEndAt":1783517783878}
DEFAULT 2026-07-08T13:36:24.324630431Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:24.324] LLM metrics — TTFT=192ms prompt_tokens=2088 completion_tokens=37
DEFAULT 2026-07-08T13:36:24.326181683Z [resource.labels.instanceId: convergent-ai] [13:36:24.325] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:36:24.327074197Z [resource.labels.instanceId: convergent-ai] [13:36:24.326] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:36:24.327131199Z [resource.labels.instanceId: convergent-ai] [13:36:24.326] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:36:24.379663557Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 345.9ms
DEFAULT 2026-07-08T13:36:24.379779057Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:36:24.379818287Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 346.2ms (content=ok)
DEFAULT 2026-07-08T13:36:24.379866515Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 346.3ms
DEFAULT 2026-07-08T13:36:24.379902541Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 349.6ms
DEFAULT 2026-07-08T13:36:24.379939859Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 5 extraction finished in 349.6ms.
DEFAULT 2026-07-08T13:36:24.380000003Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 5 background extraction results into state.
DEFAULT 2026-07-08T13:36:24.380033291Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: existing_relationship -> timeline
DEFAULT 2026-07-08T13:36:24.548139901Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:36:24.548247633Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":80680,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":670,"agentSpeakingAt":1783517784548,"userTurnEndAt":1783517783878}
DEFAULT 2026-07-08T13:36:25.839264427Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:25.839] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:36:25.839400616Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:25.839] ── TURN 6 SUMMARY ── stt_done=? llm_start=? llm_first_token=446ms llm_done=446ms tts_start=? tts_done=1960ms
DEFAULT 2026-07-08T13:36:25.839445645Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:25.839] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:36:25.841377304Z [resource.labels.instanceId: convergent-ai] [13:36:25.840] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:36:25.842107145Z [resource.labels.instanceId: convergent-ai] [13:36:25.841] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:36:30.584334089Z [resource.labels.instanceId: convergent-ai] [13:36:30.583] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:36:31.623260131Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":87754,"contextItemCount":12,"estimatedContextTokens":286,"userTurnEndAt":1783517783878}
DEFAULT 2026-07-08T13:36:31.624749211Z [resource.labels.instanceId: convergent-ai] [13:36:31.624] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:36:31.624872717Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_ffd916be-1b8"
DEFAULT 2026-07-08T13:36:31.624911831Z [resource.labels.instanceId: convergent-ai] message: "I appreciate you sharing that; we're happy to have you here for the first time. In a perfect world, when would you like to be moving into your new home? "
DEFAULT 2026-07-08T13:36:31.624949314Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:36:31.626438016Z [resource.labels.instanceId: convergent-ai] [13:36:31.625] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:36:37.159832002Z [resource.labels.instanceId: convergent-ai] [13:36:37.159] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:37.471478966Z [resource.labels.instanceId: convergent-ai] [13:36:37.471] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:37.969314825Z [resource.labels.instanceId: convergent-ai] [13:36:37.968] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:37.969445067Z [resource.labels.instanceId: convergent-ai] transcript: "I"
DEFAULT 2026-07-08T13:36:38.269037274Z [resource.labels.instanceId: convergent-ai] [13:36:38.268] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:38.269182250Z [resource.labels.instanceId: convergent-ai] transcript: "I just want"
DEFAULT 2026-07-08T13:36:38.433154226Z [resource.labels.instanceId: convergent-ai] [13:36:38.432] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:38.433280125Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to"
DEFAULT 2026-07-08T13:36:38.579388966Z [resource.labels.instanceId: convergent-ai] [13:36:38.578] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:38.579529963Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it"
DEFAULT 2026-07-08T13:36:38.766261631Z [resource.labels.instanceId: convergent-ai] [13:36:38.765] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:38.766376578Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as"
DEFAULT 2026-07-08T13:36:39.077938423Z [resource.labels.instanceId: convergent-ai] [13:36:39.077] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:39.078073637Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon"
DEFAULT 2026-07-08T13:36:39.243990499Z [resource.labels.instanceId: convergent-ai] [13:36:39.243] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:39.244112232Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as"
DEFAULT 2026-07-08T13:36:39.265343525Z [resource.labels.instanceId: convergent-ai] [13:36:39.264] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:39.265502311Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-08T13:36:39.267554652Z [resource.labels.instanceId: convergent-ai] [13:36:39.266] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:36:39.267653666Z [resource.labels.instanceId: convergent-ai] user_transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-08T13:36:39.267681852Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:39.267708953Z [resource.labels.instanceId: convergent-ai] [13:36:39.267] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:36:39.267742250Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-08T13:36:39.369457604Z [resource.labels.instanceId: convergent-ai] [13:36:39.368] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:39.369600175Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-08T13:36:40.364624905Z [resource.labels.instanceId: convergent-ai] [13:36:40.364] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:40.364723531Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like"
DEFAULT 2026-07-08T13:36:40.823483577Z [resource.labels.instanceId: convergent-ai] [13:36:40.822] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:40.823605665Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if"
DEFAULT 2026-07-08T13:36:40.988516926Z [resource.labels.instanceId: convergent-ai] [13:36:40.987] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:40.988681692Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you"
DEFAULT 2026-07-08T13:36:41.135349061Z [resource.labels.instanceId: convergent-ai] [13:36:41.134] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.135484356Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask"
DEFAULT 2026-07-08T13:36:41.321083568Z [resource.labels.instanceId: convergent-ai] [13:36:41.320] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.321223083Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me"
DEFAULT 2026-07-08T13:36:41.465250672Z [resource.labels.instanceId: convergent-ai] [13:36:41.464] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.465391677Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I"
DEFAULT 2026-07-08T13:36:41.651846448Z [resource.labels.instanceId: convergent-ai] [13:36:41.651] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.651975654Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I can"
DEFAULT 2026-07-08T13:36:41.672834121Z [resource.labels.instanceId: convergent-ai] [13:36:41.672] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.672964451Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today"
DEFAULT 2026-07-08T13:36:41.694074690Z [resource.labels.instanceId: convergent-ai] [13:36:41.693] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:41.694211075Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:41.696457962Z [resource.labels.instanceId: convergent-ai] [13:36:41.695] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:36:41.696585949Z [resource.labels.instanceId: convergent-ai] user_transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:41.696631827Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:41.696663278Z [resource.labels.instanceId: convergent-ai] [13:36:41.695] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:36:41.696700058Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:41.860771580Z [resource.labels.instanceId: convergent-ai] [13:36:41.860] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:42.255422788Z [resource.labels.instanceId: convergent-ai] [13:36:42.254] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:42.256808531Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:42.256] STT final transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.256915483Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:42.256] STT complete (-1ms): "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.259565223Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.265361183Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:36:42.268958482Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:42.268] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:36:42.271233382Z [resource.labels.instanceId: convergent-ai] [13:36:42.257] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:36:42.271332489Z [resource.labels.instanceId: convergent-ai] user_transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.271378797Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:42.271411103Z [resource.labels.instanceId: convergent-ai] [13:36:42.258] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:42.271444170Z [resource.labels.instanceId: convergent-ai] [13:36:42.258] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:36:42.271549498Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.271591520Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:36:42.271622621Z [resource.labels.instanceId: convergent-ai] [13:36:42.258] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:36:42.271653662Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible. Like, if you ask me, I can move in today."
DEFAULT 2026-07-08T13:36:42.271689502Z [resource.labels.instanceId: convergent-ai] [13:36:42.259] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:36:42.271724111Z [resource.labels.instanceId: convergent-ai] [13:36:42.260] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:36:42.271756207Z [resource.labels.instanceId: convergent-ai] [13:36:42.260] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:36:42.271857752Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_57cf03dd-25c"
DEFAULT 2026-07-08T13:36:42.271897769Z [resource.labels.instanceId: convergent-ai] [13:36:42.260] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:36:42.271936676Z [resource.labels.instanceId: convergent-ai] [13:36:42.261] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:36:42.272026427Z [resource.labels.instanceId: convergent-ai] [13:36:42.263] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:36:42.272087065Z [resource.labels.instanceId: convergent-ai] [13:36:42.265] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:36:42.272123528Z [resource.labels.instanceId: convergent-ai] [13:36:42.267] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:36:42.618059838Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:42.617] First chunk/token received (TTFT: 349ms)
DEFAULT 2026-07-08T13:36:42.632246626Z [resource.labels.instanceId: convergent-ai] [13:36:42.631] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:36:42.636395026Z [resource.labels.instanceId: convergent-ai] [13:36:42.633] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:36:42.636529304Z [resource.labels.instanceId: convergent-ai] [13:36:42.633] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:36:42.636570684Z [resource.labels.instanceId: convergent-ai] [13:36:42.633] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:36:42.640432008Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 377.1ms
DEFAULT 2026-07-08T13:36:42.640553122Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:36:42.640626791Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 377.3ms (content=ok)
DEFAULT 2026-07-08T13:36:42.640818280Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage1 extraction: 377.6ms
DEFAULT 2026-07-08T13:36:42.640877308Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 380.9ms
DEFAULT 2026-07-08T13:36:42.640917586Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 6 extraction finished in 380.9ms.
DEFAULT 2026-07-08T13:36:42.640948721Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 6 background extraction results into state.
DEFAULT 2026-07-08T13:36:42.640978178Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: timeline -> co_borrower
DEFAULT 2026-07-08T13:36:42.673531716Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:42.673] Stream complete (Total: 405ms, chunks: 9)
DEFAULT 2026-07-08T13:36:42.673942490Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:42.673] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:36:42.674006718Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:42.673] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:36:42.674047755Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":7,"sessionAgeMs":98805,"contextItemCount":0,"estimatedContextTokens":2154,"ttftMs":369,"userTurnEndAt":1783517802256}
DEFAULT 2026-07-08T13:36:42.674094195Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:42.673] LLM metrics — TTFT=369ms prompt_tokens=2154 completion_tokens=45
DEFAULT 2026-07-08T13:36:42.675663411Z [resource.labels.instanceId: convergent-ai] [13:36:42.675] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:36:42.676494659Z [resource.labels.instanceId: convergent-ai] [13:36:42.675] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:36:42.676552575Z [resource.labels.instanceId: convergent-ai] [13:36:42.675] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:36:43.077581212Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:36:43.077716367Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":7,"sessionAgeMs":99209,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":821,"agentSpeakingAt":1783517803077,"userTurnEndAt":1783517802256}
DEFAULT 2026-07-08T13:36:44.790848054Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:44.790] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:36:44.790985938Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:44.790] ── TURN 7 SUMMARY ── stt_done=? llm_start=? llm_first_token=417ms llm_done=417ms tts_start=? tts_done=2534ms
DEFAULT 2026-07-08T13:36:44.791022740Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:44.790] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:36:44.792791292Z [resource.labels.instanceId: convergent-ai] [13:36:44.792] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:36:44.793534540Z [resource.labels.instanceId: convergent-ai] [13:36:44.792] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:36:50.864455538Z [resource.labels.instanceId: convergent-ai] [13:36:50.863] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:36:51.910777661Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":7,"sessionAgeMs":108042,"contextItemCount":14,"estimatedContextTokens":353,"userTurnEndAt":1783517802256}
DEFAULT 2026-07-08T13:36:51.912446042Z [resource.labels.instanceId: convergent-ai] [13:36:51.911] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:36:51.912586614Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_57cf03dd-25c"
DEFAULT 2026-07-08T13:36:51.912638540Z [resource.labels.instanceId: convergent-ai] message: "I love that enthusiasm! I've noted that you're looking to move as quickly as possible. Will you be applying for this mortgage on your own, or will there be a co-borrower joining you? "
DEFAULT 2026-07-08T13:36:51.912671762Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:36:51.914668609Z [resource.labels.instanceId: convergent-ai] [13:36:51.913] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:36:56.319720324Z [resource.labels.instanceId: convergent-ai] [13:36:56.319] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:56.516387515Z [resource.labels.instanceId: convergent-ai] [13:36:56.515] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:57.139865353Z [resource.labels.instanceId: convergent-ai] [13:36:57.139] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.139983692Z [resource.labels.instanceId: convergent-ai] transcript: "I"
DEFAULT 2026-07-08T13:36:57.305516501Z [resource.labels.instanceId: convergent-ai] [13:36:57.304] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.305664613Z [resource.labels.instanceId: convergent-ai] transcript: "I will"
DEFAULT 2026-07-08T13:36:57.472009619Z [resource.labels.instanceId: convergent-ai] [13:36:57.471] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.472132222Z [resource.labels.instanceId: convergent-ai] transcript: "I will be"
DEFAULT 2026-07-08T13:36:57.638866250Z [resource.labels.instanceId: convergent-ai] [13:36:57.638] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.638992940Z [resource.labels.instanceId: convergent-ai] transcript: "I will be doing"
DEFAULT 2026-07-08T13:36:57.665486356Z [resource.labels.instanceId: convergent-ai] [13:36:57.664] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.665600771Z [resource.labels.instanceId: convergent-ai] transcript: "I will be doing it on my"
DEFAULT 2026-07-08T13:36:57.687536354Z [resource.labels.instanceId: convergent-ai] [13:36:57.687] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:36:57.687668457Z [resource.labels.instanceId: convergent-ai] transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.690054662Z [resource.labels.instanceId: convergent-ai] [13:36:57.689] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:36:57.690173532Z [resource.labels.instanceId: convergent-ai] user_transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.690208812Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:57.690242267Z [resource.labels.instanceId: convergent-ai] [13:36:57.689] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:36:57.690268194Z [resource.labels.instanceId: convergent-ai] transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.790193144Z [resource.labels.instanceId: convergent-ai] [13:36:57.789] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:57.791443697Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:57.791] STT final transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.791573998Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:57.791] STT complete (-1ms): "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.795059153Z [resource.labels.instanceId: convergent-ai] [13:36:57.791] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:36:57.795173548Z [resource.labels.instanceId: convergent-ai] user_transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.795209995Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:36:57.795237043Z [resource.labels.instanceId: convergent-ai] [13:36:57.793] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:36:57.795268801Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517816254.6377
DEFAULT 2026-07-08T13:36:57.795301730Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:36:57.795335533Z [resource.labels.instanceId: convergent-ai] [13:36:57.793] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:36:57.795373391Z [resource.labels.instanceId: convergent-ai] [13:36:57.793] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:36:57.795405806Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.795434138Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:36:57.921089235Z [resource.labels.instanceId: convergent-ai] [13:36:57.920] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:36:57.921204780Z [resource.labels.instanceId: convergent-ai] transcript: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.921701356Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I will be doing it on my own."
DEFAULT 2026-07-08T13:36:57.921768346Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 6 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:36:57.921807366Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 6 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:36:57.921907370Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:36:57.922153974Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:36:57.922201463Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=co_borrower
DEFAULT 2026-07-08T13:36:57.922247279Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:36:57.922278052Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:36:57.922309888Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:36:57.922341907Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:36:57.922501437Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:36:57.925021145Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:36:57.925125091Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "co_borrower" is 1
DEFAULT 2026-07-08T13:36:57.925179546Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): START
DEFAULT 2026-07-08T13:36:57.926127238Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":114058,"contextItemCount":15,"estimatedContextTokens":360,"userTurnEndAt":1783517817791}
DEFAULT 2026-07-08T13:36:57.927000547Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:36:57.930160022Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:36:57.930] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:36:57.932585140Z [resource.labels.instanceId: convergent-ai] [13:36:57.921] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:36:57.932656140Z [resource.labels.instanceId: convergent-ai] [13:36:57.922] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:36:57.932691597Z [resource.labels.instanceId: convergent-ai] [13:36:57.922] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:36:57.932728354Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8c4f37a6-c9d"
DEFAULT 2026-07-08T13:36:57.932766220Z [resource.labels.instanceId: convergent-ai] [13:36:57.922] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:36:57.932818749Z [resource.labels.instanceId: convergent-ai] [13:36:57.923] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:36:58.201111942Z [resource.labels.instanceId: convergent-ai] [13:36:58.193] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:36:58.201165904Z [resource.labels.instanceId: convergent-ai] [13:36:58.193] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:36:58.201196043Z [resource.labels.instanceId: convergent-ai] [13:36:58.196] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:36:58.201254629Z [resource.labels.instanceId: convergent-ai] [13:36:58.196] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:36:58.201298981Z [resource.labels.instanceId: convergent-ai] [13:36:58.196] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:36:58.203419808Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): Cerebras call (attempt 1) took 278.2ms
DEFAULT 2026-07-08T13:36:58.203550138Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:36:58.203603441Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower]): TOTAL 278.3ms (content=ok)
DEFAULT 2026-07-08T13:36:58.203643507Z [resource.labels.instanceId: convergent-ai] [context-manager]: Ã¢Å“â€¦ Transitioning to STAGE 2 Pre-Qualification Discovery!
DEFAULT 2026-07-08T13:36:58.203688510Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 278.6ms
DEFAULT 2026-07-08T13:36:58.203724509Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 281.8ms
DEFAULT 2026-07-08T13:36:58.203755007Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 7 extraction finished in 281.8ms.
DEFAULT 2026-07-08T13:36:58.203792686Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 7 background extraction results into state.
DEFAULT 2026-07-08T13:36:58.203832735Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning activeStage: 1 -> 2
DEFAULT 2026-07-08T13:36:58.203896912Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: co_borrower -> gross_annual_income
DEFAULT 2026-07-08T13:36:58.670671441Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:36:58.670797078Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":114802,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":879,"agentSpeakingAt":1783517818670,"userTurnEndAt":1783517817791}
DEFAULT 2026-07-08T13:36:58.966076485Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:58.965] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:36:58.966187761Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:58.965] ── TURN 8 SUMMARY ── stt_done=? llm_start=? llm_first_token=404ms llm_done=404ms tts_start=? tts_done=1174ms
DEFAULT 2026-07-08T13:36:58.966213137Z [resource.labels.instanceId: convergent-ai] [pipeline][13:36:58.965] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:36:58.967752497Z [resource.labels.instanceId: convergent-ai] [13:36:58.967] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:36:58.968335248Z [resource.labels.instanceId: convergent-ai] [13:36:58.967] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:37:00.224577488Z [resource.labels.instanceId: convergent-ai] [13:37:00.224] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:37:01.243447733Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":117375,"contextItemCount":16,"estimatedContextTokens":373,"userTurnEndAt":1783517817791}
DEFAULT 2026-07-08T13:37:01.244612118Z [resource.labels.instanceId: convergent-ai] [13:37:01.244] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:37:01.244724694Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8c4f37a6-c9d"
DEFAULT 2026-07-08T13:37:01.244761416Z [resource.labels.instanceId: convergent-ai] message: "Got it, you'll be heading into this process solo. "
DEFAULT 2026-07-08T13:37:01.245075969Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:37:01.246129875Z [resource.labels.instanceId: convergent-ai] [13:37:01.245] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:37:02.052555131Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:01.951342+00:00 convergent-ai CRON[49197]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:37:02.052556316Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:01.952960+00:00 convergent-ai CRON[49196]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:37:06.660239572Z [resource.labels.instanceId: convergent-ai] [13:37:06.659] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:06.922535608Z [resource.labels.instanceId: convergent-ai] [13:37:06.922] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:07.539976025Z [resource.labels.instanceId: convergent-ai] [13:37:07.539] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:07.540090006Z [resource.labels.instanceId: convergent-ai] transcript: "Yeah"
DEFAULT 2026-07-08T13:37:07.560889813Z [resource.labels.instanceId: convergent-ai] [13:37:07.560] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:07.561014703Z [resource.labels.instanceId: convergent-ai] transcript: "Yeah, that'"
DEFAULT 2026-07-08T13:37:07.581366797Z [resource.labels.instanceId: convergent-ai] [13:37:07.580] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:07.581501239Z [resource.labels.instanceId: convergent-ai] transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.603036749Z [resource.labels.instanceId: convergent-ai] [13:37:07.602] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:37:07.603168231Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.603212376Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:37:07.603893632Z [resource.labels.instanceId: convergent-ai] [13:37:07.602] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:37:07.603993784Z [resource.labels.instanceId: convergent-ai] transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.706328780Z [resource.labels.instanceId: convergent-ai] [13:37:07.705] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:07.707724774Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:07.707] STT final transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.707821923Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:07.707] STT complete (-1ms): "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.711333241Z [resource.labels.instanceId: convergent-ai] [13:37:07.708] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:37:07.711437040Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.711480949Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:37:07.711509993Z [resource.labels.instanceId: convergent-ai] [13:37:07.709] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:37:07.711551017Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517826595.661
DEFAULT 2026-07-08T13:37:07.711587462Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:37:07.711623771Z [resource.labels.instanceId: convergent-ai] [13:37:07.709] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:07.711660518Z [resource.labels.instanceId: convergent-ai] [13:37:07.709] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:37:07.711697706Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.711733348Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:37:07.748419188Z [resource.labels.instanceId: convergent-ai] [13:37:07.747] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:37:07.748557448Z [resource.labels.instanceId: convergent-ai] transcript: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.749093888Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Yeah, that's right."
DEFAULT 2026-07-08T13:37:07.749164759Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 7 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:37:07.749201805Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 7 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:37:07.749352741Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:37:07.749831285Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:37:07.749895659Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=gross_annual_income
DEFAULT 2026-07-08T13:37:07.749929947Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.5ms
DEFAULT 2026-07-08T13:37:07.749964523Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:37:07.750002484Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:37:07.750030409Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:37:07.750209099Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.8ms (handled=false)
DEFAULT 2026-07-08T13:37:07.752899151Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.6ms (corrected=false)
DEFAULT 2026-07-08T13:37:07.752997448Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "gross_annual_income" is 1
DEFAULT 2026-07-08T13:37:07.753623778Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): START
DEFAULT 2026-07-08T13:37:07.754706737Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":123886,"contextItemCount":17,"estimatedContextTokens":377,"userTurnEndAt":1783517827707}
DEFAULT 2026-07-08T13:37:07.755591554Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:37:07.758888737Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:07.758] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:37:07.760938399Z [resource.labels.instanceId: convergent-ai] [13:37:07.748] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:37:07.761005762Z [resource.labels.instanceId: convergent-ai] [13:37:07.749] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:37:07.761041049Z [resource.labels.instanceId: convergent-ai] [13:37:07.750] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:37:07.761069662Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_b2f0454c-8d7"
DEFAULT 2026-07-08T13:37:07.761097563Z [resource.labels.instanceId: convergent-ai] [13:37:07.750] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:37:07.761127686Z [resource.labels.instanceId: convergent-ai] [13:37:07.751] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:37:07.761162006Z [resource.labels.instanceId: convergent-ai] [13:37:07.753] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:37:07.761195696Z [resource.labels.instanceId: convergent-ai] [13:37:07.755] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:37:07.761237358Z [resource.labels.instanceId: convergent-ai] [13:37:07.757] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:37:07.951323884Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:07.951] First chunk/token received (TTFT: 193ms)
DEFAULT 2026-07-08T13:37:07.989978712Z [resource.labels.instanceId: convergent-ai] [13:37:07.989] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:37:07.994522631Z [resource.labels.instanceId: convergent-ai] [13:37:07.991] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:37:07.994632845Z [resource.labels.instanceId: convergent-ai] [13:37:07.991] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:37:07.994673579Z [resource.labels.instanceId: convergent-ai] [13:37:07.991] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:37:08.020337826Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:08.020] Stream complete (Total: 262ms, chunks: 9)
DEFAULT 2026-07-08T13:37:08.020699712Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:08.020] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:37:08.020807624Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:08.020] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:37:08.020872333Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":124152,"contextItemCount":0,"estimatedContextTokens":3556,"ttftMs":237,"userTurnEndAt":1783517827707}
DEFAULT 2026-07-08T13:37:08.020908047Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:08.020] LLM metrics — TTFT=237ms prompt_tokens=3556 completion_tokens=29
DEFAULT 2026-07-08T13:37:08.022388330Z [resource.labels.instanceId: convergent-ai] [13:37:08.022] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:37:08.026208304Z [resource.labels.instanceId: convergent-ai] [13:37:08.022] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:37:08.026305088Z [resource.labels.instanceId: convergent-ai] [13:37:08.022] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:37:08.054278787Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): Cerebras call (attempt 1) took 300.5ms
DEFAULT 2026-07-08T13:37:08.054402490Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:37:08.054443871Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): TOTAL 300.7ms (content=ok)
DEFAULT 2026-07-08T13:37:08.054682792Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 301.7ms
DEFAULT 2026-07-08T13:37:08.054741942Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 305.4ms
DEFAULT 2026-07-08T13:37:08.054780525Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 8 extraction finished in 305.4ms.
DEFAULT 2026-07-08T13:37:08.054922933Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 8 background extraction results into state.
DEFAULT 2026-07-08T13:37:08.378276789Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:37:08.378410497Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":124510,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":671,"agentSpeakingAt":1783517828378,"userTurnEndAt":1783517827707}
DEFAULT 2026-07-08T13:37:09.520086349Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:09.519] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:37:09.520207193Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:09.519] ── TURN 9 SUMMARY ── stt_done=? llm_start=? llm_first_token=313ms llm_done=313ms tts_start=? tts_done=1812ms
DEFAULT 2026-07-08T13:37:09.520240635Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:09.519] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:37:09.521871048Z [resource.labels.instanceId: convergent-ai] [13:37:09.521] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:37:09.522482781Z [resource.labels.instanceId: convergent-ai] [13:37:09.521] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:37:10.649361328Z [resource.labels.instanceId: convergent-ai] [13:37:10.648] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:10.939399276Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:37:11.099961616Z [resource.labels.instanceId: convergent-ai] [13:37:11.099] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:13.101367627Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → speaking
DEFAULT 2026-07-08T13:37:13.102946838Z [resource.labels.instanceId: convergent-ai] [13:37:13.102] [34mDEBUG[39m (102): [36mresumed false interrupted speech[39m
DEFAULT 2026-07-08T13:37:13.103055788Z [resource.labels.instanceId: convergent-ai] timeout: 2000
DEFAULT 2026-07-08T13:37:13.104002253Z [resource.labels.instanceId: convergent-ai] [13:37:13.103] [33mWARN[39m (102): [36mSegmentSynchronizerImpl.onPlaybackStarted called after startFuture is set[39m
DEFAULT 2026-07-08T13:37:17.453941679Z [resource.labels.instanceId: convergent-ai] [13:37:17.453] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:37:17.520486851Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":133652,"contextItemCount":18,"estimatedContextTokens":416,"userTurnEndAt":1783517827707}
DEFAULT 2026-07-08T13:37:17.521917534Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:37:17.527438055Z [resource.labels.instanceId: convergent-ai] [13:37:17.501] [33mWARN[39m (102): [36mInput is shorter by 69206 samples; silence has been prepended to align the input channel.[39m
DEFAULT 2026-07-08T13:37:17.527575945Z [resource.labels.instanceId: convergent-ai] [13:37:17.521] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:37:17.527616468Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_b2f0454c-8d7"
DEFAULT 2026-07-08T13:37:17.527647832Z [resource.labels.instanceId: convergent-ai] message: "To get a better picture of your financial situation, what is your total gross annual household income before taxes? A general range works perfectly fine. "
DEFAULT 2026-07-08T13:37:17.527681696Z [resource.labels.instanceId: convergent-ai] [13:37:17.522] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:37:23.528962319Z [resource.labels.instanceId: convergent-ai] [13:37:23.528] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:24.090089029Z [resource.labels.instanceId: convergent-ai] [13:37:24.089] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:24.680166737Z [resource.labels.instanceId: convergent-ai] [13:37:24.679] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:24.680323890Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:37:24.992915297Z [resource.labels.instanceId: convergent-ai] [13:37:24.992] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:24.993051783Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my"
DEFAULT 2026-07-08T13:37:25.803090421Z [resource.labels.instanceId: convergent-ai] [13:37:25.802] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:25.803215954Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income"
DEFAULT 2026-07-08T13:37:26.254648182Z [resource.labels.instanceId: convergent-ai] [13:37:26.254] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:26.254782883Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household"
DEFAULT 2026-07-08T13:37:26.751028393Z [resource.labels.instanceId: convergent-ai] [13:37:26.750] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:26.751172065Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is"
DEFAULT 2026-07-08T13:37:27.250788731Z [resource.labels.instanceId: convergent-ai] [13:37:27.250] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:27.250911711Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around"
INFO 2026-07-08T13:37:28.015375077Z [resource.labels.instanceId: convergent-ai] Beginning ApplyConfigTask.
DEFAULT 2026-07-08T13:37:28.034751847Z [resource.labels.instanceId: convergent-ai] [13:37:28.034] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:28.034886532Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 7"
DEFAULT 2026-07-08T13:37:28.052916924Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.015743+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.0153Z OSConfigAgent Info: Beginning ApplyConfigTask.
DEFAULT 2026-07-08T13:37:28.052919948Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016134+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052920289Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016260+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052920572Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016299+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052920760Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016323+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052921014Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016357+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052921273Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016398+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052921527Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016424+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052921732Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016451+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052921920Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016528+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052922128Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016558+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052922350Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016586+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052922535Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016607+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052923702Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016634+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052923967Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016659+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052924186Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016684+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052924433Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016714+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052924655Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016743+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052924870Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016770+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052925052Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016803+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:37:28.052925233Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016829+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.052925637Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.016855+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:37:58 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:37:28.055275046Z [resource.labels.instanceId: convergent-ai] [13:37:28.054] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:28.055399116Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 7000"
DEFAULT 2026-07-08T13:37:28.077540626Z [resource.labels.instanceId: convergent-ai] [13:37:28.076] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:28.077680114Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 70000"
INFO 2026-07-08T13:37:28.106551241Z [resource.labels.instanceId: convergent-ai] Executing policy "goog-ops-agent-policy"
INFO 2026-07-08T13:37:28.107045873Z [resource.labels.instanceId: convergent-ai] Validate: resource "wait-for-cloud-init" validation successful.
DEFAULT 2026-07-08T13:37:28.253162669Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.106660+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.1064Z OSConfigAgent Info: Executing policy "goog-ops-agent-policy"
DEFAULT 2026-07-08T13:37:28.253166149Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.107138+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.1070Z OSConfigAgent Info: Validate: resource "wait-for-cloud-init" validation successful.
INFO 2026-07-08T13:37:28.489083405Z [resource.labels.instanceId: convergent-ai] Check state: resource "wait-for-cloud-init" state is COMPLIANT.
DEFAULT 2026-07-08T13:37:28.518350344Z [resource.labels.instanceId: convergent-ai] [13:37:28.517] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:28.518502562Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 70000 dollars"
INFO 2026-07-08T13:37:28.532351111Z [resource.labels.instanceId: convergent-ai] Validate: resource "add-repo" validation successful.
INFO 2026-07-08T13:37:28.532549262Z [resource.labels.instanceId: convergent-ai] Check state: resource "add-repo" state is COMPLIANT.
INFO 2026-07-08T13:37:28.532603143Z [resource.labels.instanceId: convergent-ai] Validate: resource "install-pkg" validation successful.
DEFAULT 2026-07-08T13:37:28.538450098Z [resource.labels.instanceId: convergent-ai] [13:37:28.537] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:28.538589295Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 70000 dollars per year."
INFO 2026-07-08T13:37:28.555356595Z [resource.labels.instanceId: convergent-ai] Check state: resource "install-pkg" state is COMPLIANT.
INFO 2026-07-08T13:37:28.555440735Z [resource.labels.instanceId: convergent-ai] Policy "goog-ops-agent-policy" resource "wait-for-cloud-init" state: COMPLIANT
INFO 2026-07-08T13:37:28.555492550Z [resource.labels.instanceId: convergent-ai] Policy "goog-ops-agent-policy" resource "add-repo" state: COMPLIANT
INFO 2026-07-08T13:37:28.555525827Z [resource.labels.instanceId: convergent-ai] Policy "goog-ops-agent-policy" resource "install-pkg" state: COMPLIANT
DEFAULT 2026-07-08T13:37:28.559433703Z [resource.labels.instanceId: convergent-ai] [13:37:28.558] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:37:28.559568890Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.559598009Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:37:28.560226641Z [resource.labels.instanceId: convergent-ai] [13:37:28.559] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:37:28.560353659Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 70000 dollars per year."
INFO 2026-07-08T13:37:28.599828180Z [resource.labels.instanceId: convergent-ai] Successfully completed ApplyConfigTask
DEFAULT 2026-07-08T13:37:28.629817916Z [resource.labels.instanceId: convergent-ai] [13:37:28.629] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:28.652928302Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.489165+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.4890Z OSConfigAgent Info: Check state: resource "wait-for-cloud-init" state is COMPLIANT.
DEFAULT 2026-07-08T13:37:28.652929303Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.532420+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5323Z OSConfigAgent Info: Validate: resource "add-repo" validation successful.
DEFAULT 2026-07-08T13:37:28.652929596Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.532579+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5325Z OSConfigAgent Info: Check state: resource "add-repo" state is COMPLIANT.
DEFAULT 2026-07-08T13:37:28.652929792Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.532657+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5325Z OSConfigAgent Info: Validate: resource "install-pkg" validation successful.
DEFAULT 2026-07-08T13:37:28.652930051Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.555455+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5552Z OSConfigAgent Info: Check state: resource "install-pkg" state is COMPLIANT.
DEFAULT 2026-07-08T13:37:28.652930237Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.555612+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5554Z OSConfigAgent Info: Policy "goog-ops-agent-policy" resource "wait-for-cloud-init" state: COMPLIANT
DEFAULT 2026-07-08T13:37:28.652930452Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.555671+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5554Z OSConfigAgent Info: Policy "goog-ops-agent-policy" resource "add-repo" state: COMPLIANT
DEFAULT 2026-07-08T13:37:28.652930568Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.555727+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5555Z OSConfigAgent Info: Policy "goog-ops-agent-policy" resource "install-pkg" state: COMPLIANT
DEFAULT 2026-07-08T13:37:28.652931202Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:28.599937+00:00 convergent-ai OSConfigAgent[621]: 2026-07-08T13:37:28.5997Z OSConfigAgent Info: Successfully completed ApplyConfigTask
DEFAULT 2026-07-08T13:37:28.827139310Z [resource.labels.instanceId: convergent-ai] [13:37:28.826] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:28.828539794Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:28.828] STT final transcript: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.828648327Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:28.828] STT complete (-1ms): "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.831515024Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.831659204Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 8 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:37:28.831702736Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 8 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:37:28.831974839Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:37:28.832101098Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:37:28.832180861Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=gross_annual_income
DEFAULT 2026-07-08T13:37:28.832221841Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:37:28.832254694Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:37:28.832285576Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:37:28.832325443Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:37:28.832546909Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:37:28.835386914Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.7ms (corrected=false)
DEFAULT 2026-07-08T13:37:28.835572502Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "gross_annual_income" is 2
DEFAULT 2026-07-08T13:37:28.835656152Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): START
DEFAULT 2026-07-08T13:37:28.836758901Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":144968,"contextItemCount":19,"estimatedContextTokens":432,"userTurnEndAt":1783517848828}
DEFAULT 2026-07-08T13:37:28.837725111Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:37:28.841356664Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:28.841] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:37:28.844184555Z [resource.labels.instanceId: convergent-ai] [13:37:28.829] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:37:28.844294921Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.844340624Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:37:28.844371884Z [resource.labels.instanceId: convergent-ai] [13:37:28.830] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:28.844400799Z [resource.labels.instanceId: convergent-ai] [13:37:28.830] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:37:28.844438655Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.844490693Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:37:28.844523283Z [resource.labels.instanceId: convergent-ai] [13:37:28.830] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:37:28.844547728Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, my income, household income is around 70000 dollars per year."
DEFAULT 2026-07-08T13:37:28.844566243Z [resource.labels.instanceId: convergent-ai] [13:37:28.830] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:37:28.844591977Z [resource.labels.instanceId: convergent-ai] [13:37:28.832] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:37:28.844630030Z [resource.labels.instanceId: convergent-ai] [13:37:28.832] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:37:28.844659877Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_15a4181b-4b4"
DEFAULT 2026-07-08T13:37:28.844729556Z [resource.labels.instanceId: convergent-ai] [13:37:28.832] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:37:28.844772920Z [resource.labels.instanceId: convergent-ai] [13:37:28.833] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:37:28.844808128Z [resource.labels.instanceId: convergent-ai] [13:37:28.835] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:37:28.844834475Z [resource.labels.instanceId: convergent-ai] [13:37:28.837] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:37:28.844872268Z [resource.labels.instanceId: convergent-ai] [13:37:28.840] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:37:29.027811834Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:29.027] First chunk/token received (TTFT: 186ms)
DEFAULT 2026-07-08T13:37:29.084704615Z [resource.labels.instanceId: convergent-ai] [13:37:29.083] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:37:29.089108439Z [resource.labels.instanceId: convergent-ai] [13:37:29.085] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:37:29.089231440Z [resource.labels.instanceId: convergent-ai] [13:37:29.085] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:37:29.089268245Z [resource.labels.instanceId: convergent-ai] [13:37:29.085] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:37:29.103064576Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:37:29.102] Stream complete (Total: 261ms, chunks: 7)
DEFAULT 2026-07-08T13:37:29.103442353Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:29.103] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:37:29.103522624Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:29.103] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:37:29.103589348Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":145235,"contextItemCount":0,"estimatedContextTokens":3613,"ttftMs":248,"userTurnEndAt":1783517848828}
DEFAULT 2026-07-08T13:37:29.103639392Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:29.103] LLM metrics — TTFT=248ms prompt_tokens=3613 completion_tokens=24
DEFAULT 2026-07-08T13:37:29.105436018Z [resource.labels.instanceId: convergent-ai] [13:37:29.105] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:37:29.106285439Z [resource.labels.instanceId: convergent-ai] [13:37:29.105] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:37:29.106382396Z [resource.labels.instanceId: convergent-ai] [13:37:29.105] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:37:29.302209744Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): Cerebras call (attempt 1) took 466.5ms
DEFAULT 2026-07-08T13:37:29.302328328Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:37:29.302357166Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, gross_annual_income]): TOTAL 466.7ms (content=ok)
DEFAULT 2026-07-08T13:37:29.377878014Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: extracted gross_annual_income=70000, awaiting confirm
DEFAULT 2026-07-08T13:37:29.378007018Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 542.5ms
DEFAULT 2026-07-08T13:37:29.378038237Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 546.0ms
DEFAULT 2026-07-08T13:37:29.378071051Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 9 extraction finished in 546.0ms.
DEFAULT 2026-07-08T13:37:29.378100375Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 9 background extraction results into state.
DEFAULT 2026-07-08T13:37:29.462117402Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:37:29.462231967Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":145593,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":633,"agentSpeakingAt":1783517849461,"userTurnEndAt":1783517848828}
DEFAULT 2026-07-08T13:37:30.204242645Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:30.203] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:37:30.204363672Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:30.204] ── TURN 10 SUMMARY ── stt_done=? llm_start=? llm_first_token=275ms llm_done=275ms tts_start=? tts_done=1375ms
DEFAULT 2026-07-08T13:37:30.204412626Z [resource.labels.instanceId: convergent-ai] [pipeline][13:37:30.204] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:37:30.207049968Z [resource.labels.instanceId: convergent-ai] [13:37:30.206] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:37:30.208005290Z [resource.labels.instanceId: convergent-ai] [13:37:30.206] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:37:33.894565302Z [resource.labels.instanceId: convergent-ai] [13:37:33.893] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:37:34.926427931Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":151058,"contextItemCount":20,"estimatedContextTokens":453,"userTurnEndAt":1783517848828}
DEFAULT 2026-07-08T13:37:34.927870710Z [resource.labels.instanceId: convergent-ai] [13:37:34.927] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:37:34.927999693Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_15a4181b-4b4"
DEFAULT 2026-07-08T13:37:34.928067811Z [resource.labels.instanceId: convergent-ai] message: "Just to confirm — you mentioned $70,000 as your gross annual income. Is that right? "
DEFAULT 2026-07-08T13:37:34.928121377Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:37:34.929572460Z [resource.labels.instanceId: convergent-ai] [13:37:34.929] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:37:39.869704019Z [resource.labels.instanceId: convergent-ai] [13:37:39.869] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:39.892001346Z [resource.labels.instanceId: convergent-ai] [13:37:39.891] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:40.823150365Z [resource.labels.instanceId: convergent-ai] [13:37:40.822] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:40.823278273Z [resource.labels.instanceId: convergent-ai] transcript: "Yes"
DEFAULT 2026-07-08T13:37:40.843447800Z [resource.labels.instanceId: convergent-ai] [13:37:40.842] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:40.843606272Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is"
DEFAULT 2026-07-08T13:37:40.864435216Z [resource.labels.instanceId: convergent-ai] [13:37:40.863] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:40.864571247Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:37:40.867067039Z [resource.labels.instanceId: convergent-ai] [13:37:40.866] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:37:40.867201586Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:37:42.982003384Z [resource.labels.instanceId: convergent-ai] [13:37:42.981] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:37:49.765614559Z [resource.labels.instanceId: convergent-ai] [13:37:49.765] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:37:50.816155505Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":11,"sessionAgeMs":166947,"contextItemCount":22,"estimatedContextTokens":497,"userTurnEndAt":1783517860996}
DEFAULT 2026-07-08T13:37:50.817587812Z [resource.labels.instanceId: convergent-ai] [13:37:50.817] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:37:50.817705180Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_fcd11a43-f94"
DEFAULT 2026-07-08T13:37:50.817745535Z [resource.labels.instanceId: convergent-ai] message: "Great, thanks for confirming. Next, could you tell me about your recurring monthly debt payments, such as car loans, student loans, or credit card minimums? "
DEFAULT 2026-07-08T13:37:50.817782724Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:37:50.819439538Z [resource.labels.instanceId: convergent-ai] [13:37:50.818] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:37:53.052629215Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:52.904992+00:00 convergent-ai PackageKit: daemon quit
DEFAULT 2026-07-08T13:37:53.052632716Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:37:52.908134+00:00 convergent-ai systemd[1]: packagekit.service: Deactivated successfully.
DEFAULT 2026-07-08T13:37:56.039586893Z [resource.labels.instanceId: convergent-ai] [13:37:56.038] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:56.327495024Z [resource.labels.instanceId: convergent-ai] [13:37:56.326] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:37:56.989695901Z [resource.labels.instanceId: convergent-ai] [13:37:56.989] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:56.989807389Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:37:57.485649125Z [resource.labels.instanceId: convergent-ai] [13:37:57.485] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:57.485770872Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah"
DEFAULT 2026-07-08T13:37:57.940013985Z [resource.labels.instanceId: convergent-ai] [13:37:57.939] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:57.940150429Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my"
DEFAULT 2026-07-08T13:37:58.753988610Z [resource.labels.instanceId: convergent-ai] [13:37:58.753] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:58.754150718Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally"
DEFAULT 2026-07-08T13:37:59.215603694Z [resource.labels.instanceId: convergent-ai] [13:37:59.215] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:59.215733694Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total"
DEFAULT 2026-07-08T13:37:59.545340398Z [resource.labels.instanceId: convergent-ai] [13:37:59.544] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:37:59.545457365Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt"
DEFAULT 2026-07-08T13:38:00.497615293Z [resource.labels.instanceId: convergent-ai] [13:38:00.497] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:00.497747227Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for"
DEFAULT 2026-07-08T13:38:00.825644358Z [resource.labels.instanceId: convergent-ai] [13:38:00.825] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:00.825771690Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every"
DEFAULT 2026-07-08T13:38:01.155058194Z [resource.labels.instanceId: convergent-ai] [13:38:01.154] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:01.155170931Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month"
DEFAULT 2026-07-08T13:38:01.444868172Z [resource.labels.instanceId: convergent-ai] [13:38:01.444] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:01.444978468Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is"
DEFAULT 2026-07-08T13:38:01.794781659Z [resource.labels.instanceId: convergent-ai] [13:38:01.794] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:01.794920068Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around"
DEFAULT 2026-07-08T13:38:02.052668778Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:38:01.957533+00:00 convergent-ai CRON[49206]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:38:02.052670018Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:38:01.959905+00:00 convergent-ai CRON[49205]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:38:03.402318051Z [resource.labels.instanceId: convergent-ai] [13:38:03.401] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:03.402480092Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around "
DEFAULT 2026-07-08T13:38:03.422766109Z [resource.labels.instanceId: convergent-ai] [13:38:03.422] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:03.422887373Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around 223"
DEFAULT 2026-07-08T13:38:03.442565091Z [resource.labels.instanceId: convergent-ai] [13:38:03.442] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:03.442697756Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.464801047Z [resource.labels.instanceId: convergent-ai] [13:38:03.464] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:38:03.464931236Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.464975354Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:03.465720355Z [resource.labels.instanceId: convergent-ai] [13:38:03.464] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:38:03.465822219Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.566920545Z [resource.labels.instanceId: convergent-ai] [13:38:03.566] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:03.568177689Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:03.567] STT final transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.568389810Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:03.568] STT complete (-1ms): "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.572045656Z [resource.labels.instanceId: convergent-ai] [13:38:03.568] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:38:03.572155584Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.572199234Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:03.572229019Z [resource.labels.instanceId: convergent-ai] [13:38:03.570] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:38:03.572265183Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517875974.6902
DEFAULT 2026-07-08T13:38:03.572293897Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:38:03.572336296Z [resource.labels.instanceId: convergent-ai] [13:38:03.570] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:03.572370781Z [resource.labels.instanceId: convergent-ai] [13:38:03.570] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:38:03.572406046Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.572434560Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:38:03.620151648Z [resource.labels.instanceId: convergent-ai] [13:38:03.619] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:38:03.620278162Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.620788781Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yeah, my totally total debt for every month is around 2230 dollars."
DEFAULT 2026-07-08T13:38:03.620864781Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 10 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:38:03.621023132Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 10 extraction resolved normally. Waited: 0.2ms
DEFAULT 2026-07-08T13:38:03.621225475Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:38:03.621570296Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:38:03.621624193Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=monthly_debt
DEFAULT 2026-07-08T13:38:03.621663811Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:38:03.622640844Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:38:03.622713572Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 1.0ms
DEFAULT 2026-07-08T13:38:03.622750469Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 2.0ms
DEFAULT 2026-07-08T13:38:03.623004824Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 1.8ms (handled=false)
DEFAULT 2026-07-08T13:38:03.626633448Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 3.5ms (corrected=false)
DEFAULT 2026-07-08T13:38:03.626745180Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "monthly_debt" is 1
DEFAULT 2026-07-08T13:38:03.626844945Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, monthly_debt]): START
DEFAULT 2026-07-08T13:38:03.627920705Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":179759,"contextItemCount":23,"estimatedContextTokens":514,"userTurnEndAt":1783517883568}
DEFAULT 2026-07-08T13:38:03.629129314Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:38:03.632558558Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:03.632] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:38:03.634760263Z [resource.labels.instanceId: convergent-ai] [13:38:03.620] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:38:03.634870850Z [resource.labels.instanceId: convergent-ai] [13:38:03.622] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:38:03.634922737Z [resource.labels.instanceId: convergent-ai] [13:38:03.623] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:38:03.634953262Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_4666e4c0-3b4"
DEFAULT 2026-07-08T13:38:03.634982022Z [resource.labels.instanceId: convergent-ai] [13:38:03.623] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:38:03.635028164Z [resource.labels.instanceId: convergent-ai] [13:38:03.624] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:38:03.635064898Z [resource.labels.instanceId: convergent-ai] [13:38:03.627] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:38:03.635094362Z [resource.labels.instanceId: convergent-ai] [13:38:03.628] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:38:03.635132262Z [resource.labels.instanceId: convergent-ai] [13:38:03.631] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:38:03.888656661Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:03.888] First chunk/token received (TTFT: 256ms)
DEFAULT 2026-07-08T13:38:03.889819673Z [resource.labels.instanceId: convergent-ai] [13:38:03.889] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:38:03.892984208Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:03.892] Stream complete (Total: 260ms, chunks: 6)
DEFAULT 2026-07-08T13:38:03.893306443Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:03.893] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:38:03.893401335Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:03.893] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:38:03.893437897Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":180025,"contextItemCount":0,"estimatedContextTokens":3716,"ttftMs":263,"userTurnEndAt":1783517883568}
DEFAULT 2026-07-08T13:38:03.893497566Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:03.893] LLM metrics — TTFT=263ms prompt_tokens=3716 completion_tokens=22
DEFAULT 2026-07-08T13:38:03.897397398Z [resource.labels.instanceId: convergent-ai] [13:38:03.891] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:38:03.897521104Z [resource.labels.instanceId: convergent-ai] [13:38:03.891] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:38:03.897560170Z [resource.labels.instanceId: convergent-ai] [13:38:03.891] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:38:03.897595787Z [resource.labels.instanceId: convergent-ai] [13:38:03.894] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:38:03.897638283Z [resource.labels.instanceId: convergent-ai] [13:38:03.894] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:38:03.897674017Z [resource.labels.instanceId: convergent-ai] [13:38:03.894] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:38:03.902085020Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, monthly_debt]): Cerebras call (attempt 1) took 275.2ms
DEFAULT 2026-07-08T13:38:03.902196488Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:38:03.902235125Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type, monthly_debt]): TOTAL 275.4ms (content=ok)
DEFAULT 2026-07-08T13:38:03.902268082Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: extracted monthly_debt=2230, awaiting confirm
DEFAULT 2026-07-08T13:38:03.902314411Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 275.6ms
DEFAULT 2026-07-08T13:38:03.902361932Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 281.2ms
DEFAULT 2026-07-08T13:38:03.902566918Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 11 extraction finished in 281.2ms.
DEFAULT 2026-07-08T13:38:03.902641192Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 11 background extraction results into state.
DEFAULT 2026-07-08T13:38:04.491319852Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:38:04.491483572Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":180623,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":923,"agentSpeakingAt":1783517884491,"userTurnEndAt":1783517883568}
DEFAULT 2026-07-08T13:38:05.287324276Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:05.287] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:38:05.287443475Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:05.287] ── TURN 12 SUMMARY ── stt_done=? llm_start=? llm_first_token=325ms llm_done=325ms tts_start=? tts_done=1719ms
DEFAULT 2026-07-08T13:38:05.287536480Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:05.287] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:38:05.289376529Z [resource.labels.instanceId: convergent-ai] [13:38:05.288] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:38:05.290087764Z [resource.labels.instanceId: convergent-ai] [13:38:05.289] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:38:08.924209756Z [resource.labels.instanceId: convergent-ai] [13:38:08.923] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:38:09.957999117Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":186089,"contextItemCount":24,"estimatedContextTokens":533,"userTurnEndAt":1783517883568}
DEFAULT 2026-07-08T13:38:09.959346206Z [resource.labels.instanceId: convergent-ai] [13:38:09.958] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:38:09.959459633Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_4666e4c0-3b4"
DEFAULT 2026-07-08T13:38:09.959511717Z [resource.labels.instanceId: convergent-ai] message: "Just to confirm — you mentioned $2,230 as your monthly debt. Is that right? "
DEFAULT 2026-07-08T13:38:09.959549048Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:38:09.959991290Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":533,"itemCount":24,"action":"compact_start","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:38:09.962075008Z [resource.labels.instanceId: convergent-ai] [13:38:09.961] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:38:10.166040061Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"context_compaction","itemsBefore":24,"itemsAfter":10,"turnNumber":12,"sessionAgeMs":186297}
DEFAULT 2026-07-08T13:38:10.166154077Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":186297,"contextItemCount":10,"estimatedContextTokens":222,"userTurnEndAt":1783517883568}
DEFAULT 2026-07-08T13:38:10.166188990Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":222,"itemCount":10,"action":"compact_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:38:10.166215560Z [resource.labels.instanceId: convergent-ai] [context]: Compacted 24Ã¢â€ â€™10 items, ~533Ã¢â€ â€™222 text tokens (last API input: 0)
DEFAULT 2026-07-08T13:38:15.409563153Z [resource.labels.instanceId: convergent-ai] [13:38:15.409] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:15.707432408Z [resource.labels.instanceId: convergent-ai] [13:38:15.707] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:16.205087490Z [resource.labels.instanceId: convergent-ai] [13:38:16.204] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:16.205198274Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:38:16.496787433Z [resource.labels.instanceId: convergent-ai] [13:38:16.496] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:16.496936432Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes"
DEFAULT 2026-07-08T13:38:16.517176485Z [resource.labels.instanceId: convergent-ai] [13:38:16.516] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:16.517314249Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that is"
DEFAULT 2026-07-08T13:38:16.538452937Z [resource.labels.instanceId: convergent-ai] [13:38:16.537] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:16.538623135Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.540632547Z [resource.labels.instanceId: convergent-ai] [13:38:16.539] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:38:16.540752751Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.540795365Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:16.540869874Z [resource.labels.instanceId: convergent-ai] [13:38:16.540] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:38:16.540915998Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.664748504Z [resource.labels.instanceId: convergent-ai] [13:38:16.664] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:16.665842639Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:16.665] STT final transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.665944462Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:16.665] STT complete (-1ms): "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.669673936Z [resource.labels.instanceId: convergent-ai] [13:38:16.666] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:38:16.669797389Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.669846733Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:16.669892640Z [resource.labels.instanceId: convergent-ai] [13:38:16.667] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:38:16.669943027Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517895344.7883
DEFAULT 2026-07-08T13:38:16.669971084Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:38:16.670002377Z [resource.labels.instanceId: convergent-ai] [13:38:16.668] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:16.670035303Z [resource.labels.instanceId: convergent-ai] [13:38:16.668] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:38:16.670063915Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.670089784Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:38:16.719985232Z [resource.labels.instanceId: convergent-ai] [13:38:16.719] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:38:16.720119415Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.720565090Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yes, that is right."
DEFAULT 2026-07-08T13:38:16.720661765Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 11 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:38:16.720705943Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 11 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:38:16.720819076Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("monthly_debt"): START
DEFAULT 2026-07-08T13:38:16.720947637Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:38:16.721105083Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:38:16.721159952Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=monthly_debt
DEFAULT 2026-07-08T13:38:16.721223957Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:38:32.691011844Z [resource.labels.instanceId: convergent-ai] [13:38:32.690] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:32.691144209Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it"
DEFAULT 2026-07-08T13:38:32.815216221Z [resource.labels.instanceId: convergent-ai] [13:38:32.814] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:32.815361507Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is"
DEFAULT 2026-07-08T13:38:33.311182874Z [resource.labels.instanceId: convergent-ai] [13:38:33.310] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:33.311302876Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around"
DEFAULT 2026-07-08T13:38:34.249845241Z [resource.labels.instanceId: convergent-ai] [13:38:34.249] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:34.250004116Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 6"
DEFAULT 2026-07-08T13:38:34.270600036Z [resource.labels.instanceId: convergent-ai] [13:38:34.270] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:34.270729335Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680"
DEFAULT 2026-07-08T13:38:34.747703318Z [resource.labels.instanceId: convergent-ai] [13:38:34.747] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:34.747847049Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh"
DEFAULT 2026-07-08T13:38:34.913229045Z [resource.labels.instanceId: convergent-ai] [13:38:34.912] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:34.913347917Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that"
DEFAULT 2026-07-08T13:38:35.079079381Z [resource.labels.instanceId: convergent-ai] [13:38:35.078] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:35.079205702Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I"
DEFAULT 2026-07-08T13:38:35.374980957Z [resource.labels.instanceId: convergent-ai] [13:38:35.374] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:35.375099912Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked"
DEFAULT 2026-07-08T13:38:35.539142939Z [resource.labels.instanceId: convergent-ai] [13:38:35.538] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:35.539264676Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked in the"
DEFAULT 2026-07-08T13:38:35.706541865Z [resource.labels.instanceId: convergent-ai] [13:38:35.706] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:35.706659781Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked in the last"
DEFAULT 2026-07-08T13:38:35.726559021Z [resource.labels.instanceId: convergent-ai] [13:38:35.726] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:35.726685882Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:35.728600617Z [resource.labels.instanceId: convergent-ai] [13:38:35.727] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:38:35.728716365Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:35.728752489Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:35.728785230Z [resource.labels.instanceId: convergent-ai] [13:38:35.728] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:38:35.728845516Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:35.929833103Z [resource.labels.instanceId: convergent-ai] [13:38:35.929] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:36.038672582Z [resource.labels.instanceId: convergent-ai] [13:38:36.038] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:36.039964667Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:36.039] STT final transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.040058197Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:36.039] STT complete (-1ms): "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.042518057Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.042610013Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 12 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:38:36.042638771Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 12 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:38:36.042703211Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:38:36.042942292Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:38:36.043010847Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=credit_range
DEFAULT 2026-07-08T13:38:36.043046535Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:38:36.043529984Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:38:36.043581413Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:38:36.043619219Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:38:36.043652255Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:38:36.045724611Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.3ms (corrected=false)
DEFAULT 2026-07-08T13:38:36.045805739Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "credit_range" is 1
DEFAULT 2026-07-08T13:38:36.045884464Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type]): START
DEFAULT 2026-07-08T13:38:36.046820664Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":14,"sessionAgeMs":212178,"contextItemCount":27,"estimatedContextTokens":589,"userTurnEndAt":1783517916039}
DEFAULT 2026-07-08T13:38:36.047626678Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:38:36.050697432Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:36.050] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:38:36.052746483Z [resource.labels.instanceId: convergent-ai] [13:38:36.040] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:38:36.052830597Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.052870581Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:36.052903603Z [resource.labels.instanceId: convergent-ai] [13:38:36.041] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:36.052941048Z [resource.labels.instanceId: convergent-ai] [13:38:36.041] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:38:36.052992472Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.053026988Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:38:36.053056421Z [resource.labels.instanceId: convergent-ai] [13:38:36.041] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:38:36.053083692Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, it is around 680 uh that I checked in the last quarter."
DEFAULT 2026-07-08T13:38:36.053113973Z [resource.labels.instanceId: convergent-ai] [13:38:36.042] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:38:36.053150681Z [resource.labels.instanceId: convergent-ai] [13:38:36.043] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:38:36.053181177Z [resource.labels.instanceId: convergent-ai] [13:38:36.043] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:38:36.053213722Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_1720a097-768"
DEFAULT 2026-07-08T13:38:36.053245657Z [resource.labels.instanceId: convergent-ai] [13:38:36.043] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:38:36.053275258Z [resource.labels.instanceId: convergent-ai] [13:38:36.044] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:38:36.053314816Z [resource.labels.instanceId: convergent-ai] [13:38:36.046] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:38:36.053348375Z [resource.labels.instanceId: convergent-ai] [13:38:36.047] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:38:36.053379756Z [resource.labels.instanceId: convergent-ai] [13:38:36.049] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:38:36.281739270Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:36.281] First chunk/token received (TTFT: 231ms)
DEFAULT 2026-07-08T13:38:36.383575310Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type]): Cerebras call (attempt 1) took 337.6ms
DEFAULT 2026-07-08T13:38:36.383708315Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:38:36.383866420Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([credit_range, rent_own, realtor_status, property_type, military_rural, job_tenure_type]): TOTAL 337.8ms (content=ok)
DEFAULT 2026-07-08T13:38:36.383995106Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: credit_range=680
DEFAULT 2026-07-08T13:38:36.384036891Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 338.0ms
DEFAULT 2026-07-08T13:38:36.384068717Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 341.1ms
DEFAULT 2026-07-08T13:38:36.384106380Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 13 extraction finished in 341.2ms.
DEFAULT 2026-07-08T13:38:36.384152746Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 13 background extraction results into state.
DEFAULT 2026-07-08T13:38:36.384187423Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: credit_range -> down_payment
DEFAULT 2026-07-08T13:38:36.434885033Z [resource.labels.instanceId: convergent-ai] [13:38:36.434] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:38:36.439011174Z [resource.labels.instanceId: convergent-ai] [13:38:36.435] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:38:36.439127294Z [resource.labels.instanceId: convergent-ai] [13:38:36.435] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:38:36.439153185Z [resource.labels.instanceId: convergent-ai] [13:38:36.435] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:38:36.516829862Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:36.516] Stream complete (Total: 466ms, chunks: 8)
DEFAULT 2026-07-08T13:38:36.517254704Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:36.517] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:38:36.517341733Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:36.517] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:38:36.517381364Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":14,"sessionAgeMs":212649,"contextItemCount":0,"estimatedContextTokens":3441,"ttftMs":389,"userTurnEndAt":1783517916039}
DEFAULT 2026-07-08T13:38:36.517559841Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:36.517] LLM metrics — TTFT=389ms prompt_tokens=3441 completion_tokens=28
DEFAULT 2026-07-08T13:38:36.519028216Z [resource.labels.instanceId: convergent-ai] [13:38:36.518] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:38:36.519764151Z [resource.labels.instanceId: convergent-ai] [13:38:36.518] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:38:36.519833729Z [resource.labels.instanceId: convergent-ai] [13:38:36.519] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:38:36.744531658Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:38:36.744647944Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":14,"sessionAgeMs":212876,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":705,"agentSpeakingAt":1783517916744,"userTurnEndAt":1783517916039}
DEFAULT 2026-07-08T13:38:37.677753837Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:37.677] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:38:37.677883118Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:37.677] ── TURN 14 SUMMARY ── stt_done=? llm_start=? llm_first_token=478ms llm_done=478ms tts_start=? tts_done=1638ms
DEFAULT 2026-07-08T13:38:37.677936614Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:37.677] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:38:37.679969851Z [resource.labels.instanceId: convergent-ai] [13:38:37.679] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:38:37.680717403Z [resource.labels.instanceId: convergent-ai] [13:38:37.679] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:38:42.533719105Z [resource.labels.instanceId: convergent-ai] [13:38:42.533] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:38:43.575923370Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":14,"sessionAgeMs":219707,"contextItemCount":28,"estimatedContextTokens":621,"userTurnEndAt":1783517916039}
DEFAULT 2026-07-08T13:38:43.577117594Z [resource.labels.instanceId: convergent-ai] [13:38:43.576] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:38:43.577233828Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_1720a097-768"
DEFAULT 2026-07-08T13:38:43.577269165Z [resource.labels.instanceId: convergent-ai] message: "Got it, thanks for sharing that. Next, how much cash do you have available for a down payment and your initial closing costs? "
DEFAULT 2026-07-08T13:38:43.577320440Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:38:43.578513030Z [resource.labels.instanceId: convergent-ai] [13:38:43.578] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:38:49.849552852Z [resource.labels.instanceId: convergent-ai] [13:38:49.849] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:49.960243225Z [resource.labels.instanceId: convergent-ai] [13:38:49.959] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:51.733035627Z [resource.labels.instanceId: convergent-ai] [13:38:51.732] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:51.733160424Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around"
DEFAULT 2026-07-08T13:38:52.663170262Z [resource.labels.instanceId: convergent-ai] [13:38:52.662] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:52.663313317Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 4"
DEFAULT 2026-07-08T13:38:52.683535390Z [resource.labels.instanceId: convergent-ai] [13:38:52.683] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:52.683669878Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 4300"
DEFAULT 2026-07-08T13:38:52.704295318Z [resource.labels.instanceId: convergent-ai] [13:38:52.703] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:52.704427075Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000"
DEFAULT 2026-07-08T13:38:53.123637523Z [resource.labels.instanceId: convergent-ai] [13:38:53.123] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:53.123764932Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars"
DEFAULT 2026-07-08T13:38:53.640837316Z [resource.labels.instanceId: convergent-ai] [13:38:53.640] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:53.640973228Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and"
DEFAULT 2026-07-08T13:38:53.950851075Z [resource.labels.instanceId: convergent-ai] [13:38:53.950] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:53.950983465Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing"
DEFAULT 2026-07-08T13:38:54.405361242Z [resource.labels.instanceId: convergent-ai] [13:38:54.404] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:54.405509530Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is"
DEFAULT 2026-07-08T13:38:54.734645336Z [resource.labels.instanceId: convergent-ai] [13:38:54.734] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:54.734779533Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around"
DEFAULT 2026-07-08T13:38:55.540993580Z [resource.labels.instanceId: convergent-ai] [13:38:55.540] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:55.541104277Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2"
DEFAULT 2026-07-08T13:38:55.562253372Z [resource.labels.instanceId: convergent-ai] [13:38:55.561] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:55.562392923Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200"
DEFAULT 2026-07-08T13:38:55.686834952Z [resource.labels.instanceId: convergent-ai] [13:38:55.686] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:55.686957861Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I"
DEFAULT 2026-07-08T13:38:55.872929990Z [resource.labels.instanceId: convergent-ai] [13:38:55.872] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:55.873055268Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am"
DEFAULT 2026-07-08T13:38:55.893682738Z [resource.labels.instanceId: convergent-ai] [13:38:55.893] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:38:55.893813719Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:55.896123977Z [resource.labels.instanceId: convergent-ai] [13:38:55.895] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:38:55.896244665Z [resource.labels.instanceId: convergent-ai] user_transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:55.896282248Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:55.896322302Z [resource.labels.instanceId: convergent-ai] [13:38:55.895] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:38:55.896359668Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.016554075Z [resource.labels.instanceId: convergent-ai] [13:38:56.015] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:56.018123975Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:56.017] STT final transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.018237981Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:56.018] STT complete (-1ms): "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.025560222Z [resource.labels.instanceId: convergent-ai] [13:38:56.018] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:38:56.025708272Z [resource.labels.instanceId: convergent-ai] user_transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.025756637Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:38:56.025793562Z [resource.labels.instanceId: convergent-ai] [13:38:56.020] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:38:56.025825340Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517929784.3416
DEFAULT 2026-07-08T13:38:56.025850542Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:38:56.025886880Z [resource.labels.instanceId: convergent-ai] [13:38:56.021] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:38:56.025918013Z [resource.labels.instanceId: convergent-ai] [13:38:56.021] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:38:56.025994130Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.026034505Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:38:56.180162131Z [resource.labels.instanceId: convergent-ai] [13:38:56.179] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:38:56.180289228Z [resource.labels.instanceId: convergent-ai] transcript: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.180792461Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Down payment is around 43000 dollars and closing cost is around 2200 and I am expecting."
DEFAULT 2026-07-08T13:38:56.180894374Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 13 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:38:56.180920833Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 13 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:38:56.181033025Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:38:56.181407321Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:38:56.181509075Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=down_payment
DEFAULT 2026-07-08T13:38:56.181543897Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:38:56.181575312Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:38:56.181614341Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:38:56.181643572Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:38:56.181806476Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.8ms (handled=false)
DEFAULT 2026-07-08T13:38:56.184533464Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:38:56.184634820Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "down_payment" is 1
DEFAULT 2026-07-08T13:38:56.184678035Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([rent_own, realtor_status, property_type, military_rural, job_tenure_type, down_payment]): START
DEFAULT 2026-07-08T13:38:56.185647351Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":15,"sessionAgeMs":232317,"contextItemCount":29,"estimatedContextTokens":643,"userTurnEndAt":1783517936018}
DEFAULT 2026-07-08T13:38:56.186611223Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:38:56.190138206Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:56.190] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:38:56.192384852Z [resource.labels.instanceId: convergent-ai] [13:38:56.180] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:38:56.192499662Z [resource.labels.instanceId: convergent-ai] [13:38:56.181] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:38:56.192540959Z [resource.labels.instanceId: convergent-ai] [13:38:56.181] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:38:56.192575560Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8fbe269e-849"
DEFAULT 2026-07-08T13:38:56.192602930Z [resource.labels.instanceId: convergent-ai] [13:38:56.182] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:38:56.192635030Z [resource.labels.instanceId: convergent-ai] [13:38:56.182] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:38:56.192662900Z [resource.labels.instanceId: convergent-ai] [13:38:56.184] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:38:56.192693870Z [resource.labels.instanceId: convergent-ai] [13:38:56.186] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:38:56.192723417Z [resource.labels.instanceId: convergent-ai] [13:38:56.188] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:38:56.390923516Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:56.390] First chunk/token received (TTFT: 200ms)
DEFAULT 2026-07-08T13:38:56.411396554Z [resource.labels.instanceId: convergent-ai] [13:38:56.410] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:38:56.414883785Z [resource.labels.instanceId: convergent-ai] [13:38:56.412] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:38:56.414997748Z [resource.labels.instanceId: convergent-ai] [13:38:56.412] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:38:56.415039668Z [resource.labels.instanceId: convergent-ai] [13:38:56.412] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:38:56.421502920Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:38:56.421] Stream complete (Total: 231ms, chunks: 5)
DEFAULT 2026-07-08T13:38:56.421844251Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:56.421] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:38:56.421938372Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:56.421] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:38:56.421975075Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":15,"sessionAgeMs":232553,"contextItemCount":0,"estimatedContextTokens":3504,"ttftMs":227,"userTurnEndAt":1783517936018}
DEFAULT 2026-07-08T13:38:56.423558910Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:56.421] LLM metrics — TTFT=227ms prompt_tokens=3504 completion_tokens=23
DEFAULT 2026-07-08T13:38:56.423669156Z [resource.labels.instanceId: convergent-ai] [13:38:56.423] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:38:56.424434597Z [resource.labels.instanceId: convergent-ai] [13:38:56.423] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:38:56.424554563Z [resource.labels.instanceId: convergent-ai] [13:38:56.423] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:38:56.501936100Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([rent_own, realtor_status, property_type, military_rural, job_tenure_type, down_payment]): Cerebras call (attempt 1) took 317.2ms
DEFAULT 2026-07-08T13:38:56.502065578Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:38:56.502118910Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([rent_own, realtor_status, property_type, military_rural, job_tenure_type, down_payment]): TOTAL 317.4ms (content=ok)
DEFAULT 2026-07-08T13:38:56.502160075Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: extracted down_payment=43000, awaiting confirm
DEFAULT 2026-07-08T13:38:56.502409899Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 317.7ms
DEFAULT 2026-07-08T13:38:56.502509133Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 321.2ms
DEFAULT 2026-07-08T13:38:56.502571230Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 14 extraction finished in 321.2ms.
DEFAULT 2026-07-08T13:38:56.502594340Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 14 background extraction results into state.
DEFAULT 2026-07-08T13:38:56.726644089Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:38:56.726830850Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":15,"sessionAgeMs":232858,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":708,"agentSpeakingAt":1783517936726,"userTurnEndAt":1783517936018}
DEFAULT 2026-07-08T13:38:57.385008977Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:57.384] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:38:57.385122111Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:57.384] ── TURN 15 SUMMARY ── stt_done=? llm_start=? llm_first_token=403ms llm_done=403ms tts_start=? tts_done=1366ms
DEFAULT 2026-07-08T13:38:57.385161640Z [resource.labels.instanceId: convergent-ai] [pipeline][13:38:57.384] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:38:57.386818353Z [resource.labels.instanceId: convergent-ai] [13:38:57.386] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:38:57.387514424Z [resource.labels.instanceId: convergent-ai] [13:38:57.386] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:39:00.653235486Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:39:00.550224+00:00 convergent-ai systemd[1]: Starting phpsessionclean.service - Clean php session files...
DEFAULT 2026-07-08T13:39:00.653236571Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:39:00.551157+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:39:08.330586219Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:39:08.330613096Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:39:08.336310648Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":16,"sessionAgeMs":244467,"contextItemCount":31,"estimatedContextTokens":667,"userTurnEndAt":1783517948178}
DEFAULT 2026-07-08T13:39:08.336764001Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:39:08.338427022Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:39:08.338] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:39:08.340727932Z [resource.labels.instanceId: convergent-ai] [13:39:08.329] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:39:08.340822846Z [resource.labels.instanceId: convergent-ai] [13:39:08.330] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:39:08.340864292Z [resource.labels.instanceId: convergent-ai] [13:39:08.330] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:39:08.340893183Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_7f2e989c-3dd"
DEFAULT 2026-07-08T13:39:08.340945687Z [resource.labels.instanceId: convergent-ai] [13:39:08.331] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:39:08.340986174Z [resource.labels.instanceId: convergent-ai] [13:39:08.331] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:39:08.341038036Z [resource.labels.instanceId: convergent-ai] [13:39:08.333] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:39:08.341078396Z [resource.labels.instanceId: convergent-ai] [13:39:08.336] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:39:08.341114003Z [resource.labels.instanceId: convergent-ai] [13:39:08.337] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:39:08.556110597Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("down_payment"): Cerebras call (attempt 1) took 225.9ms
DEFAULT 2026-07-08T13:39:08.556255304Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Classified confirmation for "down_payment" raw JSON: null
DEFAULT 2026-07-08T13:39:08.556305074Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("down_payment"): TOTAL 226.0ms (content=ok)
DEFAULT 2026-07-08T13:39:08.556338731Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: down_payment confirmed Ã¢â€ â€™ $43,000
DEFAULT 2026-07-08T13:39:08.556379216Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleStage2Confirmation: 226.2ms
DEFAULT 2026-07-08T13:39:08.556417487Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 226.2ms
DEFAULT 2026-07-08T13:39:08.556454890Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 15 extraction finished in 226.2ms.
DEFAULT 2026-07-08T13:39:08.556500477Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 15 background extraction results into state.
DEFAULT 2026-07-08T13:39:08.556529474Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: down_payment -> rent_own
DEFAULT 2026-07-08T13:39:08.614533488Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:39:08.614] First chunk/token received (TTFT: 276ms)
DEFAULT 2026-07-08T13:39:08.636116019Z [resource.labels.instanceId: convergent-ai] [13:39:08.635] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:39:08.640434067Z [resource.labels.instanceId: convergent-ai] [13:39:08.636] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:39:08.640565657Z [resource.labels.instanceId: convergent-ai] [13:39:08.637] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:39:08.640605786Z [resource.labels.instanceId: convergent-ai] [13:39:08.637] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:39:08.696839579Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:39:08.696] Stream complete (Total: 358ms, chunks: 14)
DEFAULT 2026-07-08T13:39:08.697182718Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:08.697] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:39:08.697243922Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:08.697] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:39:08.697299546Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":16,"sessionAgeMs":244829,"contextItemCount":0,"estimatedContextTokens":3627,"ttftMs":302,"userTurnEndAt":1783517948178}
DEFAULT 2026-07-08T13:39:08.697404976Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:08.697] LLM metrics — TTFT=302ms prompt_tokens=3627 completion_tokens=36
DEFAULT 2026-07-08T13:39:08.699090737Z [resource.labels.instanceId: convergent-ai] [13:39:08.698] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:39:08.699909290Z [resource.labels.instanceId: convergent-ai] [13:39:08.698] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:39:08.699985936Z [resource.labels.instanceId: convergent-ai] [13:39:08.699] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:39:08.978092973Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:39:08.978233324Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":16,"sessionAgeMs":245109,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":799,"agentSpeakingAt":1783517948977,"userTurnEndAt":1783517948178}
DEFAULT 2026-07-08T13:39:10.121845442Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:10.121] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:39:10.121981904Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:10.121] ── TURN 16 SUMMARY ── stt_done=? llm_start=? llm_first_token=519ms llm_done=519ms tts_start=? tts_done=1943ms
DEFAULT 2026-07-08T13:39:10.122024240Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:10.121] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:39:10.123676378Z [resource.labels.instanceId: convergent-ai] [13:39:10.123] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:39:10.124525384Z [resource.labels.instanceId: convergent-ai] [13:39:10.123] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:39:16.284696949Z [resource.labels.instanceId: convergent-ai] [13:39:16.284] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:39:17.331107646Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":16,"sessionAgeMs":253462,"contextItemCount":32,"estimatedContextTokens":706,"userTurnEndAt":1783517948178}
DEFAULT 2026-07-08T13:39:17.332520188Z [resource.labels.instanceId: convergent-ai] [13:39:17.331] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:39:17.332622384Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_7f2e989c-3dd"
DEFAULT 2026-07-08T13:39:17.332658743Z [resource.labels.instanceId: convergent-ai] message: "Great, thanks for confirming. Do you currently rent your home, or do you own? If you already own, are you planning to sell it before buying your next place? "
DEFAULT 2026-07-08T13:39:17.332714205Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:39:17.334559485Z [resource.labels.instanceId: convergent-ai] [13:39:17.333] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:39:22.480390530Z [resource.labels.instanceId: convergent-ai] [13:39:22.479] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:22.760908554Z [resource.labels.instanceId: convergent-ai] [13:39:22.760] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:23.365432059Z [resource.labels.instanceId: convergent-ai] [13:39:23.364] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:23.365570468Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:39:23.696354037Z [resource.labels.instanceId: convergent-ai] [13:39:23.695] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:23.696521331Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no,"
DEFAULT 2026-07-08T13:39:23.717052288Z [resource.labels.instanceId: convergent-ai] [13:39:23.716] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:23.717179337Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm"
DEFAULT 2026-07-08T13:39:24.034915311Z [resource.labels.instanceId: convergent-ai] [13:39:24.034] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:24.035036796Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently"
DEFAULT 2026-07-08T13:39:24.055436080Z [resource.labels.instanceId: convergent-ai] [13:39:24.054] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:24.055581415Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting."
DEFAULT 2026-07-08T13:39:24.057567439Z [resource.labels.instanceId: convergent-ai] [13:39:24.056] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:39:24.057667345Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh no, I'm currently renting."
DEFAULT 2026-07-08T13:39:24.057734631Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:39:24.057764555Z [resource.labels.instanceId: convergent-ai] [13:39:24.057] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:39:24.057800160Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting."
DEFAULT 2026-07-08T13:39:24.370271532Z [resource.labels.instanceId: convergent-ai] [13:39:24.369] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:24.370406720Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting."
DEFAULT 2026-07-08T13:39:25.155735329Z [resource.labels.instanceId: convergent-ai] [13:39:25.155] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:25.155864038Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So"
DEFAULT 2026-07-08T13:39:25.467051033Z [resource.labels.instanceId: convergent-ai] [13:39:25.466] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:25.467164491Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I"
DEFAULT 2026-07-08T13:39:25.778199229Z [resource.labels.instanceId: convergent-ai] [13:39:25.777] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:25.778339988Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am"
DEFAULT 2026-07-08T13:39:26.096458240Z [resource.labels.instanceId: convergent-ai] [13:39:26.095] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:26.096598942Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not"
DEFAULT 2026-07-08T13:39:26.265263151Z [resource.labels.instanceId: convergent-ai] [13:39:26.264] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:26.265379291Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a"
DEFAULT 2026-07-08T13:39:26.598127070Z [resource.labels.instanceId: convergent-ai] [13:39:26.597] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:26.598224070Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a homeowner"
DEFAULT 2026-07-08T13:39:26.618250322Z [resource.labels.instanceId: convergent-ai] [13:39:26.617] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:26.618369821Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment"
DEFAULT 2026-07-08T13:39:26.642099645Z [resource.labels.instanceId: convergent-ai] [13:39:26.641] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:26.642209695Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.644209429Z [resource.labels.instanceId: convergent-ai] [13:39:26.643] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:39:26.644322093Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.644364460Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:39:26.644396675Z [resource.labels.instanceId: convergent-ai] [13:39:26.643] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:39:26.644438870Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.764922705Z [resource.labels.instanceId: convergent-ai] [13:39:26.764] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:26.766086667Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:26.765] STT final transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.766201908Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:26.766] STT complete (-1ms): "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.769823069Z [resource.labels.instanceId: convergent-ai] [13:39:26.766] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:39:26.769933946Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.769972436Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:39:26.770009088Z [resource.labels.instanceId: convergent-ai] [13:39:26.767] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:39:26.770044230Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783517962415.205
DEFAULT 2026-07-08T13:39:26.770073399Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:39:26.770117344Z [resource.labels.instanceId: convergent-ai] [13:39:26.768] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:26.770152339Z [resource.labels.instanceId: convergent-ai] [13:39:26.768] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:39:26.770179731Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:26.770214038Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:39:26.829220641Z [resource.labels.instanceId: convergent-ai] [13:39:26.828] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:39:26.829354010Z [resource.labels.instanceId: convergent-ai] transcript: "Uh no, I'm currently renting. So I am not a homeowner at the moment."
DEFAULT 2026-07-08T13:39:27.041670264Z [resource.labels.instanceId: convergent-ai] [13:39:27.041] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:39:27.045021111Z [resource.labels.instanceId: convergent-ai] [13:39:27.042] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:39:27.045128871Z [resource.labels.instanceId: convergent-ai] [13:39:27.042] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:39:27.045157154Z [resource.labels.instanceId: convergent-ai] [13:39:27.042] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:39:27.066221159Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:39:27.065] Stream complete (Total: 227ms, chunks: 8)
DEFAULT 2026-07-08T13:39:27.066553065Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:27.066] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:39:27.066625548Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:27.066] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:39:27.066663158Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":17,"sessionAgeMs":263198,"contextItemCount":0,"estimatedContextTokens":3610,"ttftMs":208,"userTurnEndAt":1783517966766}
DEFAULT 2026-07-08T13:39:27.067665129Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:27.066] LLM metrics — TTFT=208ms prompt_tokens=3610 completion_tokens=26
DEFAULT 2026-07-08T13:39:27.068496050Z [resource.labels.instanceId: convergent-ai] [13:39:27.068] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:39:27.069287544Z [resource.labels.instanceId: convergent-ai] [13:39:27.068] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:39:27.069361289Z [resource.labels.instanceId: convergent-ai] [13:39:27.068] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:39:27.108155285Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([rent_own, realtor_status, property_type, military_rural, job_tenure_type]): Cerebras call (attempt 1) took 274.9ms
DEFAULT 2026-07-08T13:39:27.108288979Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:39:27.108331526Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([rent_own, realtor_status, property_type, military_rural, job_tenure_type]): TOTAL 275.0ms (content=ok)
DEFAULT 2026-07-08T13:39:27.108377590Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: rent_own=rent
DEFAULT 2026-07-08T13:39:27.108405376Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 275.2ms
DEFAULT 2026-07-08T13:39:27.108449714Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 278.3ms
DEFAULT 2026-07-08T13:39:27.108504219Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 16 extraction finished in 278.3ms.
DEFAULT 2026-07-08T13:39:27.108538949Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 16 background extraction results into state.
DEFAULT 2026-07-08T13:39:27.108586417Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: rent_own -> realtor_status
DEFAULT 2026-07-08T13:39:27.341226757Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:39:27.341352793Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":17,"sessionAgeMs":263473,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":575,"agentSpeakingAt":1783517967341,"userTurnEndAt":1783517966766}
DEFAULT 2026-07-08T13:39:28.170706585Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:28.170] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:39:28.170830636Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:28.170] ── TURN 17 SUMMARY ── stt_done=? llm_start=? llm_first_token=300ms llm_done=300ms tts_start=? tts_done=1404ms
DEFAULT 2026-07-08T13:39:28.170861267Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:28.170] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:39:28.172211264Z [resource.labels.instanceId: convergent-ai] [13:39:28.171] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:39:28.172849192Z [resource.labels.instanceId: convergent-ai] [13:39:28.172] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:39:32.254222068Z [resource.labels.instanceId: convergent-ai] [13:39:32.253] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:39:33.290435374Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":17,"sessionAgeMs":269422,"contextItemCount":34,"estimatedContextTokens":753,"userTurnEndAt":1783517966766}
DEFAULT 2026-07-08T13:39:33.291670093Z [resource.labels.instanceId: convergent-ai] [13:39:33.291] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:39:33.291804033Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_3a2be540-7af"
DEFAULT 2026-07-08T13:39:33.291864003Z [resource.labels.instanceId: convergent-ai] message: "Understood, thanks for letting me know. Have you already connected with a real estate agent to help you with your search? "
DEFAULT 2026-07-08T13:39:33.291904260Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:39:33.293160605Z [resource.labels.instanceId: convergent-ai] [13:39:33.292] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:39:40.689709643Z [resource.labels.instanceId: convergent-ai] [13:39:40.689] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:40.975499059Z [resource.labels.instanceId: convergent-ai] [13:39:40.975] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:41.970574577Z [resource.labels.instanceId: convergent-ai] [13:39:41.970] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:41.970703482Z [resource.labels.instanceId: convergent-ai] transcript: "No,"
DEFAULT 2026-07-08T13:39:41.990398230Z [resource.labels.instanceId: convergent-ai] [13:39:41.989] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:41.990528545Z [resource.labels.instanceId: convergent-ai] transcript: "No, I"
DEFAULT 2026-07-08T13:39:42.120662020Z [resource.labels.instanceId: convergent-ai] [13:39:42.120] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:42.120780624Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have"
DEFAULT 2026-07-08T13:39:42.245596469Z [resource.labels.instanceId: convergent-ai] [13:39:42.245] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:42.245712114Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not"
DEFAULT 2026-07-08T13:39:42.907592492Z [resource.labels.instanceId: convergent-ai] [13:39:42.906] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:42.907699591Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected"
DEFAULT 2026-07-08T13:39:43.241768908Z [resource.labels.instanceId: convergent-ai] [13:39:43.241] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:43.241902746Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with"
DEFAULT 2026-07-08T13:39:43.696768470Z [resource.labels.instanceId: convergent-ai] [13:39:43.696] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:43.696883868Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone"
DEFAULT 2026-07-08T13:39:44.028901379Z [resource.labels.instanceId: convergent-ai] [13:39:44.028] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.029020208Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that"
DEFAULT 2026-07-08T13:39:44.049716478Z [resource.labels.instanceId: convergent-ai] [13:39:44.049] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.049842646Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's"
DEFAULT 2026-07-08T13:39:44.196982595Z [resource.labels.instanceId: convergent-ai] [13:39:44.196] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.197092138Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why"
DEFAULT 2026-07-08T13:39:44.360561223Z [resource.labels.instanceId: convergent-ai] [13:39:44.360] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.360694686Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I"
DEFAULT 2026-07-08T13:39:44.527861465Z [resource.labels.instanceId: convergent-ai] [13:39:44.527] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.527969667Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I came"
DEFAULT 2026-07-08T13:39:44.548078181Z [resource.labels.instanceId: convergent-ai] [13:39:44.547] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.548195391Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I came here to you"
DEFAULT 2026-07-08T13:39:44.569696750Z [resource.labels.instanceId: convergent-ai] [13:39:44.569] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:39:44.569816058Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.571774959Z [resource.labels.instanceId: convergent-ai] [13:39:44.570] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:39:44.571886676Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.571914700Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:39:44.571940035Z [resource.labels.instanceId: convergent-ai] [13:39:44.571] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:39:44.571971246Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.809997604Z [resource.labels.instanceId: convergent-ai] [13:39:44.809] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:44.817566781Z [resource.labels.instanceId: convergent-ai] [13:39:44.817] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:44.819556149Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:44.818] STT final transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.819679125Z [resource.labels.instanceId: convergent-ai] [pipeline][13:39:44.818] STT complete (-1ms): "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.821388411Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.821536335Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 16 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:39:44.821678585Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 16 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:39:44.821756534Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:39:44.821814049Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:39:44.821941739Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=realtor_status
DEFAULT 2026-07-08T13:39:44.821997843Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:39:44.822040629Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:39:44.822082917Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:39:44.822128305Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:39:44.822251683Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:39:44.824926273Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:39:44.825008841Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "realtor_status" is 1
DEFAULT 2026-07-08T13:39:44.825095380Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([realtor_status, property_type, military_rural, job_tenure_type]): START
DEFAULT 2026-07-08T13:39:44.826126710Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":18,"sessionAgeMs":280957,"contextItemCount":35,"estimatedContextTokens":770,"userTurnEndAt":1783517984818}
DEFAULT 2026-07-08T13:39:44.826911674Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:39:44.830748519Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:39:44.830] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:39:44.833430067Z [resource.labels.instanceId: convergent-ai] [13:39:44.819] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:39:44.833600156Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.833639547Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:39:44.833665174Z [resource.labels.instanceId: convergent-ai] [13:39:44.820] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:39:44.833708901Z [resource.labels.instanceId: convergent-ai] [13:39:44.820] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:39:44.833756449Z [resource.labels.instanceId: convergent-ai] audioTranscript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.833801853Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:39:44.833828962Z [resource.labels.instanceId: convergent-ai] [13:39:44.820] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:39:44.833862920Z [resource.labels.instanceId: convergent-ai] transcript: "No, I have not connected with anyone, that's why I came here to you."
DEFAULT 2026-07-08T13:39:44.833901577Z [resource.labels.instanceId: convergent-ai] [13:39:44.820] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:39:44.833935927Z [resource.labels.instanceId: convergent-ai] [13:39:44.821] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:39:44.833963790Z [resource.labels.instanceId: convergent-ai] [13:39:44.822] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:39:44.833991547Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_9612a1f1-c83"
DEFAULT 2026-07-08T13:39:44.834024230Z [resource.labels.instanceId: convergent-ai] [13:39:44.822] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:39:44.834054707Z [resource.labels.instanceId: convergent-ai] [13:39:44.823] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:39:44.834083208Z [resource.labels.instanceId: convergent-ai] [13:39:44.825] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:39:44.834115782Z [resource.labels.instanceId: convergent-ai] [13:39:44.826] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:39:44.834142206Z [resource.labels.instanceId: convergent-ai] [13:39:44.829] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:40:01.968819739Z [resource.labels.instanceId: convergent-ai] [13:40:01.956] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:40:01.968856237Z [resource.labels.instanceId: convergent-ai] [13:40:01.957] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:40:01.968889558Z [resource.labels.instanceId: convergent-ai] [13:40:01.957] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:40:01.968920677Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_76831f52-a82"
DEFAULT 2026-07-08T13:40:01.968952676Z [resource.labels.instanceId: convergent-ai] [13:40:01.957] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:40:01.968987274Z [resource.labels.instanceId: convergent-ai] [13:40:01.958] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:40:01.970172973Z [resource.labels.instanceId: convergent-ai] [13:40:01.960] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:40:01.970233494Z [resource.labels.instanceId: convergent-ai] [13:40:01.961] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:40:01.970294567Z [resource.labels.instanceId: convergent-ai] [13:40:01.964] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:40:02.052288419Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.977163+00:00 convergent-ai CRON[49259]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:40:02.052289709Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.979166+00:00 convergent-ai systemd[1]: Starting sysstat-collect.service - system activity accounting tool...
DEFAULT 2026-07-08T13:40:02.052289968Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980119+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052290204Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980531+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052290445Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980668+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052290637Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980728+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052290820Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980814+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052291003Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980846+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052291218Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980878+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052291399Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980916+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052291593Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980951+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052291775Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.980984+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052292009Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.981019+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052292275Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.981328+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052292455Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.981440+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052292684Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.981945+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052292958Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982023+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052293135Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982094+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052293325Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982160+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052293508Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982228+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052293721Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982294+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:40:02.052293910Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982360+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052294090Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.982428+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:40:31 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:40:02.052294268Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.983515+00:00 convergent-ai CRON[49257]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:40:02.052294487Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.988172+00:00 convergent-ai systemd[1]: sysstat-collect.service: Deactivated successfully.
DEFAULT 2026-07-08T13:40:02.052294683Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:40:01.988448+00:00 convergent-ai systemd[1]: Finished sysstat-collect.service - system activity accounting tool.
DEFAULT 2026-07-08T13:40:02.248229681Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([property_type, military_rural, job_tenure_type, target_price]): Cerebras call (attempt 1) took 288.0ms
DEFAULT 2026-07-08T13:40:02.248427051Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:40:02.248523372Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([property_type, military_rural, job_tenure_type, target_price]): TOTAL 288.3ms (content=ok)
DEFAULT 2026-07-08T13:40:02.248583578Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: extracted target_price=500000, awaiting confirm
DEFAULT 2026-07-08T13:40:02.248619574Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 288.6ms
DEFAULT 2026-07-08T13:40:02.248653373Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 291.7ms
DEFAULT 2026-07-08T13:40:02.248686879Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 18 extraction finished in 291.7ms.
DEFAULT 2026-07-08T13:40:02.248717043Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 18 background extraction results into state.
DEFAULT 2026-07-08T13:40:02.314906910Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:40:02.314] First chunk/token received (TTFT: 349ms)
DEFAULT 2026-07-08T13:40:02.381019190Z [resource.labels.instanceId: convergent-ai] [13:40:02.380] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:40:02.384431450Z [resource.labels.instanceId: convergent-ai] [13:40:02.381] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:40:02.384574154Z [resource.labels.instanceId: convergent-ai] [13:40:02.381] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:40:02.384620400Z [resource.labels.instanceId: convergent-ai] [13:40:02.382] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:40:02.393682012Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:40:02.393] Stream complete (Total: 428ms, chunks: 6)
DEFAULT 2026-07-08T13:40:02.394033485Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:02.393] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:40:02.394105775Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:02.393] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:40:02.394148610Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":19,"sessionAgeMs":298526,"contextItemCount":0,"estimatedContextTokens":3708,"ttftMs":420,"userTurnEndAt":1783518001953}
DEFAULT 2026-07-08T13:40:02.394193222Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:02.394] LLM metrics — TTFT=420ms prompt_tokens=3708 completion_tokens=25
DEFAULT 2026-07-08T13:40:02.395800922Z [resource.labels.instanceId: convergent-ai] [13:40:02.395] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:40:02.396559011Z [resource.labels.instanceId: convergent-ai] [13:40:02.395] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:40:02.396619665Z [resource.labels.instanceId: convergent-ai] [13:40:02.395] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:40:02.859526589Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:40:02.859648073Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":19,"sessionAgeMs":298991,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":906,"agentSpeakingAt":1783518002859,"userTurnEndAt":1783518001953}
DEFAULT 2026-07-08T13:40:03.590253549Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:03.589] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:40:03.590402839Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:03.590] ── TURN 19 SUMMARY ── stt_done=? llm_start=? llm_first_token=440ms llm_done=440ms tts_start=? tts_done=1636ms
DEFAULT 2026-07-08T13:40:03.590449433Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:03.590] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:40:03.592039412Z [resource.labels.instanceId: convergent-ai] [13:40:03.591] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:40:03.592672574Z [resource.labels.instanceId: convergent-ai] [13:40:03.591] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:40:07.214184791Z [resource.labels.instanceId: convergent-ai] [13:40:07.213] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:40:08.247738051Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":19,"sessionAgeMs":304379,"contextItemCount":38,"estimatedContextTokens":832,"userTurnEndAt":1783518001953}
DEFAULT 2026-07-08T13:40:08.248938736Z [resource.labels.instanceId: convergent-ai] [13:40:08.248] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:40:08.249055379Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_76831f52-a82"
DEFAULT 2026-07-08T13:40:08.249093018Z [resource.labels.instanceId: convergent-ai] message: "Just to confirm — you mentioned $500,000 as your target purchase price. Is that right? "
DEFAULT 2026-07-08T13:40:08.249130443Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:40:08.250571158Z [resource.labels.instanceId: convergent-ai] [13:40:08.250] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:40:14.290048932Z [resource.labels.instanceId: convergent-ai] [13:40:14.289] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:14.426352443Z [resource.labels.instanceId: convergent-ai] [13:40:14.425] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:15.055281492Z [resource.labels.instanceId: convergent-ai] [13:40:15.054] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:15.055406170Z [resource.labels.instanceId: convergent-ai] transcript: "Yes"
DEFAULT 2026-07-08T13:40:15.076196447Z [resource.labels.instanceId: convergent-ai] [13:40:15.075] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:15.076325865Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is"
DEFAULT 2026-07-08T13:40:15.098888587Z [resource.labels.instanceId: convergent-ai] [13:40:15.098] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:15.099004544Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.101313865Z [resource.labels.instanceId: convergent-ai] [13:40:15.100] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:40:15.101451769Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.101502670Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:40:15.101534473Z [resource.labels.instanceId: convergent-ai] [13:40:15.100] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:40:15.101567052Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.223519116Z [resource.labels.instanceId: convergent-ai] [13:40:15.222] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:15.224784313Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:15.224] STT final transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.224902662Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:15.224] STT complete (-1ms): "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.228646237Z [resource.labels.instanceId: convergent-ai] [13:40:15.225] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:40:15.228784612Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.228824062Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:40:15.228852916Z [resource.labels.instanceId: convergent-ai] [13:40:15.226] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:40:15.228883380Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518014224.2498
DEFAULT 2026-07-08T13:40:15.228923506Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:40:15.228960017Z [resource.labels.instanceId: convergent-ai] [13:40:15.227] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:15.228994133Z [resource.labels.instanceId: convergent-ai] [13:40:15.227] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:40:15.229022627Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.229065541Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:40:15.370165484Z [resource.labels.instanceId: convergent-ai] [13:40:15.369] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:40:15.370308805Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.370825691Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Yes, it is right."
DEFAULT 2026-07-08T13:40:15.370916021Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 18 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:40:15.370956497Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 18 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:40:15.371056472Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("target_price"): START
DEFAULT 2026-07-08T13:40:15.371181862Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:40:15.371451924Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:40:15.371551317Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=target_price
DEFAULT 2026-07-08T13:40:15.371596453Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:40:15.371651771Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:40:15.371689309Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:40:15.371726712Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:40:38.771284904Z [resource.labels.instanceId: convergent-ai] [13:40:38.770] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:38.771406473Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better"
DEFAULT 2026-07-08T13:40:38.895311743Z [resource.labels.instanceId: convergent-ai] [13:40:38.894] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:38.895432424Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better choice"
DEFAULT 2026-07-08T13:40:38.915614692Z [resource.labels.instanceId: convergent-ai] [13:40:38.915] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:38.915758700Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment"
DEFAULT 2026-07-08T13:40:38.937174065Z [resource.labels.instanceId: convergent-ai] [13:40:38.936] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:38.937296088Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:38.939387897Z [resource.labels.instanceId: convergent-ai] [13:40:38.938] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:40:38.939508311Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:38.939554391Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:40:38.939589846Z [resource.labels.instanceId: convergent-ai] [13:40:38.938] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:40:38.939627868Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.062088843Z [resource.labels.instanceId: convergent-ai] [13:40:39.061] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:39.063279575Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:39.063] STT final transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.063417782Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:39.063] STT complete (-1ms): "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.067083698Z [resource.labels.instanceId: convergent-ai] [13:40:39.063] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:40:39.067196979Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.067238375Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:40:39.067277713Z [resource.labels.instanceId: convergent-ai] [13:40:39.065] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:40:39.067318738Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518033724.7402
DEFAULT 2026-07-08T13:40:39.067361981Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:40:39.067397479Z [resource.labels.instanceId: convergent-ai] [13:40:39.065] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:39.067484735Z [resource.labels.instanceId: convergent-ai] [13:40:39.065] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:40:39.067552879Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.067656222Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:40:39.219428030Z [resource.labels.instanceId: convergent-ai] [13:40:39.218] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:40:39.219569504Z [resource.labels.instanceId: convergent-ai] transcript: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.219989268Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I'm looking to start a family so I guess single family home would be a better choice at this moment."
DEFAULT 2026-07-08T13:40:39.220070424Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 19 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:40:39.220616798Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 19 extraction resolved normally. Waited: 0.1ms
DEFAULT 2026-07-08T13:40:39.220694945Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:40:39.220736168Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:40:39.220784671Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=property_type
DEFAULT 2026-07-08T13:40:39.220820462Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:40:39.220900613Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:40:39.220934649Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:40:39.220964823Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:40:39.221008768Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:40:39.223573610Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.5ms (corrected=false)
DEFAULT 2026-07-08T13:40:39.223789879Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "property_type" is 1
DEFAULT 2026-07-08T13:40:39.223866639Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([property_type, military_rural, job_tenure_type]): START
DEFAULT 2026-07-08T13:40:39.224973429Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":21,"sessionAgeMs":335356,"contextItemCount":41,"estimatedContextTokens":910,"userTurnEndAt":1783518039063}
DEFAULT 2026-07-08T13:40:39.226001647Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:40:39.229453984Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:40:39.229] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:40:39.231566425Z [resource.labels.instanceId: convergent-ai] [13:40:39.219] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:40:39.231674654Z [resource.labels.instanceId: convergent-ai] [13:40:39.220] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:40:39.231740459Z [resource.labels.instanceId: convergent-ai] [13:40:39.221] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:40:39.231776693Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_08fcbec7-add"
DEFAULT 2026-07-08T13:40:39.231812043Z [resource.labels.instanceId: convergent-ai] [13:40:39.221] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:40:39.231844957Z [resource.labels.instanceId: convergent-ai] [13:40:39.221] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:40:39.231886456Z [resource.labels.instanceId: convergent-ai] [13:40:39.223] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:40:39.231918915Z [resource.labels.instanceId: convergent-ai] [13:40:39.225] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:40:39.231958471Z [resource.labels.instanceId: convergent-ai] [13:40:39.228] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:40:39.414531363Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:40:39.414] First chunk/token received (TTFT: 185ms)
DEFAULT 2026-07-08T13:40:39.453949921Z [resource.labels.instanceId: convergent-ai] [13:40:39.453] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:40:39.457246838Z [resource.labels.instanceId: convergent-ai] [13:40:39.454] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:40:39.457369951Z [resource.labels.instanceId: convergent-ai] [13:40:39.454] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:40:39.457405578Z [resource.labels.instanceId: convergent-ai] [13:40:39.455] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:40:39.499805788Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:40:39.499] Stream complete (Total: 270ms, chunks: 12)
DEFAULT 2026-07-08T13:40:39.500137958Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:39.500] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:40:39.500194630Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:39.500] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:40:39.500233940Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":21,"sessionAgeMs":335632,"contextItemCount":0,"estimatedContextTokens":3831,"ttftMs":230,"userTurnEndAt":1783518039063}
DEFAULT 2026-07-08T13:40:39.500274628Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:39.500] LLM metrics — TTFT=230ms prompt_tokens=3831 completion_tokens=47
DEFAULT 2026-07-08T13:40:39.501830713Z [resource.labels.instanceId: convergent-ai] [13:40:39.501] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:40:39.502557669Z [resource.labels.instanceId: convergent-ai] [13:40:39.501] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:40:39.502640967Z [resource.labels.instanceId: convergent-ai] [13:40:39.501] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:40:39.521536492Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([property_type, military_rural, job_tenure_type]): Cerebras call (attempt 1) took 297.7ms
DEFAULT 2026-07-08T13:40:39.521657470Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:40:39.521703583Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([property_type, military_rural, job_tenure_type]): TOTAL 297.8ms (content=ok)
DEFAULT 2026-07-08T13:40:39.521733305Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: property_type=single_family
DEFAULT 2026-07-08T13:40:39.521752335Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 298.0ms
DEFAULT 2026-07-08T13:40:39.521797021Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 301.3ms
DEFAULT 2026-07-08T13:40:39.521829583Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 20 extraction finished in 301.5ms.
DEFAULT 2026-07-08T13:40:39.521861823Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 20 background extraction results into state.
DEFAULT 2026-07-08T13:40:39.521894686Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: property_type -> military_rural
DEFAULT 2026-07-08T13:40:39.898280901Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:40:39.898415027Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":21,"sessionAgeMs":336030,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":835,"agentSpeakingAt":1783518039898,"userTurnEndAt":1783518039063}
DEFAULT 2026-07-08T13:40:41.575614810Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:41.575] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:40:41.575747009Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:41.575] ── TURN 21 SUMMARY ── stt_done=? llm_start=? llm_first_token=437ms llm_done=437ms tts_start=? tts_done=2512ms
DEFAULT 2026-07-08T13:40:41.575786378Z [resource.labels.instanceId: convergent-ai] [pipeline][13:40:41.575] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:40:41.577186682Z [resource.labels.instanceId: convergent-ai] [13:40:41.576] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:40:41.577901017Z [resource.labels.instanceId: convergent-ai] [13:40:41.577] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:40:50.004874227Z [resource.labels.instanceId: convergent-ai] [13:40:50.004] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:40:51.068513341Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":21,"sessionAgeMs":347200,"contextItemCount":42,"estimatedContextTokens":963,"userTurnEndAt":1783518039063}
DEFAULT 2026-07-08T13:40:51.069992507Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:40:51.070580934Z [resource.labels.instanceId: convergent-ai] [13:40:51.069] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:40:51.070700378Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_08fcbec7-add"
DEFAULT 2026-07-08T13:40:51.070788780Z [resource.labels.instanceId: convergent-ai] message: "That sounds like a wonderful goal, John. A single-family home is a great choice for starting a family. Do you have any military service history, or are you looking at a property in a rural or suburban location? "
DEFAULT 2026-07-08T13:40:51.071372668Z [resource.labels.instanceId: convergent-ai] [13:40:51.070] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:40:57.500158972Z [resource.labels.instanceId: convergent-ai] [13:40:57.499] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:57.639117987Z [resource.labels.instanceId: convergent-ai] [13:40:57.638] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:40:58.918638312Z [resource.labels.instanceId: convergent-ai] [13:40:58.918] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:58.918808755Z [resource.labels.instanceId: convergent-ai] transcript: "Subur"
DEFAULT 2026-07-08T13:40:58.940350276Z [resource.labels.instanceId: convergent-ai] [13:40:58.939] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:58.940491222Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban"
DEFAULT 2026-07-08T13:40:59.207936852Z [resource.labels.instanceId: convergent-ai] [13:40:59.207] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:59.208065849Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban would"
DEFAULT 2026-07-08T13:40:59.375169584Z [resource.labels.instanceId: convergent-ai] [13:40:59.374] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:59.375294043Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban would be"
DEFAULT 2026-07-08T13:40:59.539676974Z [resource.labels.instanceId: convergent-ai] [13:40:59.539] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:59.539807787Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban would be a"
DEFAULT 2026-07-08T13:40:59.704881937Z [resource.labels.instanceId: convergent-ai] [13:40:59.704] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:59.705005047Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban would be a good"
DEFAULT 2026-07-08T13:40:59.726273403Z [resource.labels.instanceId: convergent-ai] [13:40:59.725] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:40:59.726392552Z [resource.labels.instanceId: convergent-ai] transcript: "Suburban would be a good choice."
DEFAULT 2026-07-08T13:40:59.728744947Z [resource.labels.instanceId: convergent-ai] [13:40:59.727] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:41:02.431804211Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:02.431] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:41:02.433371987Z [resource.labels.instanceId: convergent-ai] [13:41:02.432] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:41:02.434070226Z [resource.labels.instanceId: convergent-ai] [13:41:02.433] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:41:12.418547309Z [resource.labels.instanceId: convergent-ai] [13:41:12.415] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:41:13.487324750Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":22,"sessionAgeMs":369617,"contextItemCount":44,"estimatedContextTokens":1027,"userTurnEndAt":1783518059888}
DEFAULT 2026-07-08T13:41:13.487803827Z [resource.labels.instanceId: convergent-ai] [13:41:13.487] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:41:13.487926684Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_765d7d8d-06e"
DEFAULT 2026-07-08T13:41:13.487960234Z [resource.labels.instanceId: convergent-ai] message: "Got it, suburban locations can offer a great balance for a growing family. To wrap things up, could you tell me a bit about your current job tenure and your income type—for example, are you salaried, hourly, or self-employed? "
DEFAULT 2026-07-08T13:41:13.488010943Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:41:13.488289444Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":1027,"itemCount":44,"action":"compact_start","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:41:13.490443658Z [resource.labels.instanceId: convergent-ai] [13:41:13.489] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:41:13.799789408Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"context_compaction","itemsBefore":44,"itemsAfter":10,"turnNumber":22,"sessionAgeMs":369931}
DEFAULT 2026-07-08T13:41:13.799907355Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":22,"sessionAgeMs":369931,"contextItemCount":10,"estimatedContextTokens":371,"userTurnEndAt":1783518059888}
DEFAULT 2026-07-08T13:41:13.799952956Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":371,"itemCount":10,"action":"compact_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:41:13.799986169Z [resource.labels.instanceId: convergent-ai] [context]: Compacted 44Ã¢â€ â€™10 items, ~1027Ã¢â€ â€™371 text tokens (last API input: 0)
DEFAULT 2026-07-08T13:41:22.596845100Z [resource.labels.instanceId: convergent-ai] [13:41:22.596] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:22.679112983Z [resource.labels.instanceId: convergent-ai] [13:41:22.678] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:23.389257558Z [resource.labels.instanceId: convergent-ai] [13:41:23.388] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:23.389380524Z [resource.labels.instanceId: convergent-ai] transcript: "I"
DEFAULT 2026-07-08T13:41:23.534647358Z [resource.labels.instanceId: convergent-ai] [13:41:23.534] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:23.534783749Z [resource.labels.instanceId: convergent-ai] transcript: "I am"
DEFAULT 2026-07-08T13:41:24.040978613Z [resource.labels.instanceId: convergent-ai] [13:41:24.040] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:24.041116079Z [resource.labels.instanceId: convergent-ai] transcript: "I am currently"
DEFAULT 2026-07-08T13:41:24.207192288Z [resource.labels.instanceId: convergent-ai] [13:41:24.206] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:24.207295782Z [resource.labels.instanceId: convergent-ai] transcript: "I am currently self"
DEFAULT 2026-07-08T13:41:24.227692840Z [resource.labels.instanceId: convergent-ai] [13:41:24.227] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:24.227828148Z [resource.labels.instanceId: convergent-ai] transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.230102873Z [resource.labels.instanceId: convergent-ai] [13:41:24.229] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:41:24.230219639Z [resource.labels.instanceId: convergent-ai] user_transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.230252124Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:41:24.230284076Z [resource.labels.instanceId: convergent-ai] [13:41:24.229] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:41:24.230333129Z [resource.labels.instanceId: convergent-ai] transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.331887863Z [resource.labels.instanceId: convergent-ai] [13:41:24.331] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:24.333054933Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:24.332] STT final transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.333167298Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:24.332] STT complete (-1ms): "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.336862460Z [resource.labels.instanceId: convergent-ai] [13:41:24.333] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:41:24.336975727Z [resource.labels.instanceId: convergent-ai] user_transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.337021450Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:41:24.337061153Z [resource.labels.instanceId: convergent-ai] [13:41:24.334] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:41:24.337111881Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518082613.6956
DEFAULT 2026-07-08T13:41:24.337157001Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:41:24.337197423Z [resource.labels.instanceId: convergent-ai] [13:41:24.335] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:24.337239408Z [resource.labels.instanceId: convergent-ai] [13:41:24.335] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:41:24.337273323Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.337302918Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:41:24.381073984Z [resource.labels.instanceId: convergent-ai] [13:41:24.380] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:41:24.381184404Z [resource.labels.instanceId: convergent-ai] transcript: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.381697827Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I am currently self employed."
DEFAULT 2026-07-08T13:41:24.381777527Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 21 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:41:24.381813151Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 21 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:41:24.381953176Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:41:24.382161642Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:41:24.382216700Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=job_tenure_type
DEFAULT 2026-07-08T13:41:24.382256169Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:41:24.382290514Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:41:24.382316854Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:41:24.382352768Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:41:24.382521583Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:41:24.384692008Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.1ms (corrected=false)
DEFAULT 2026-07-08T13:41:24.384834610Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "job_tenure_type" is 1
DEFAULT 2026-07-08T13:41:24.384873457Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([job_tenure_type]): START
DEFAULT 2026-07-08T13:41:24.385724483Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":23,"sessionAgeMs":380517,"contextItemCount":45,"estimatedContextTokens":1035,"userTurnEndAt":1783518084332}
DEFAULT 2026-07-08T13:41:24.386570143Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:41:24.390613199Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:24.390] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:41:24.393928700Z [resource.labels.instanceId: convergent-ai] [13:41:24.381] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:41:24.394078188Z [resource.labels.instanceId: convergent-ai] [13:41:24.382] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:41:24.394118149Z [resource.labels.instanceId: convergent-ai] [13:41:24.382] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:41:24.394170437Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_00b9f80a-7c4"
DEFAULT 2026-07-08T13:41:24.394224683Z [resource.labels.instanceId: convergent-ai] [13:41:24.382] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:41:24.394263295Z [resource.labels.instanceId: convergent-ai] [13:41:24.383] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:41:24.394325914Z [resource.labels.instanceId: convergent-ai] [13:41:24.385] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:41:24.394357781Z [resource.labels.instanceId: convergent-ai] [13:41:24.386] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:41:24.394407459Z [resource.labels.instanceId: convergent-ai] [13:41:24.389] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:41:24.572435261Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:24.572] First chunk/token received (TTFT: 182ms)
DEFAULT 2026-07-08T13:41:24.591673541Z [resource.labels.instanceId: convergent-ai] [13:41:24.591] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:41:24.594847862Z [resource.labels.instanceId: convergent-ai] [13:41:24.592] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:41:24.594956070Z [resource.labels.instanceId: convergent-ai] [13:41:24.592] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:41:24.594998635Z [resource.labels.instanceId: convergent-ai] [13:41:24.592] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:41:24.633584501Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([job_tenure_type]): Cerebras call (attempt 1) took 248.6ms
DEFAULT 2026-07-08T13:41:24.633686971Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:41:24.633715474Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([job_tenure_type]): TOTAL 248.8ms (content=ok)
DEFAULT 2026-07-08T13:41:24.633839365Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: job_tenure_type=self-employed
DEFAULT 2026-07-08T13:41:24.634048147Z [resource.labels.instanceId: convergent-ai] [context-manager]: Ã¢Å“â€¦ Transitioning to STAGE 2 Closing Transition!
DEFAULT 2026-07-08T13:41:24.634113548Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage2 extraction: 249.3ms
DEFAULT 2026-07-08T13:41:24.634152716Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 252.2ms
DEFAULT 2026-07-08T13:41:24.634200230Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 22 extraction finished in 252.2ms.
DEFAULT 2026-07-08T13:41:24.634245324Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 22 background extraction results into state.
DEFAULT 2026-07-08T13:41:24.634277131Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: job_tenure_type -> stage2_closing_offer
DEFAULT 2026-07-08T13:41:24.642493416Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:24.642] Stream complete (Total: 252ms, chunks: 14)
DEFAULT 2026-07-08T13:41:24.642765515Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:24.642] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:41:24.642878234Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:24.642] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:41:24.642930845Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":23,"sessionAgeMs":380774,"contextItemCount":0,"estimatedContextTokens":3540,"ttftMs":206,"userTurnEndAt":1783518084332}
DEFAULT 2026-07-08T13:41:24.642969302Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:24.642] LLM metrics — TTFT=206ms prompt_tokens=3540 completion_tokens=45
DEFAULT 2026-07-08T13:41:24.644483972Z [resource.labels.instanceId: convergent-ai] [13:41:24.644] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:41:24.645179316Z [resource.labels.instanceId: convergent-ai] [13:41:24.644] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:41:24.645260682Z [resource.labels.instanceId: convergent-ai] [13:41:24.644] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:41:24.970407117Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:41:24.970565083Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":23,"sessionAgeMs":381102,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":638,"agentSpeakingAt":1783518084970,"userTurnEndAt":1783518084332}
DEFAULT 2026-07-08T13:41:26.788250748Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:26.787] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:41:26.788379970Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:26.788] ── TURN 23 SUMMARY ── stt_done=? llm_start=? llm_first_token=310ms llm_done=310ms tts_start=? tts_done=2455ms
DEFAULT 2026-07-08T13:41:26.788430552Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:26.788] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:41:26.789861337Z [resource.labels.instanceId: convergent-ai] [13:41:26.789] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:41:26.790496727Z [resource.labels.instanceId: convergent-ai] [13:41:26.789] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:41:36.203799628Z [resource.labels.instanceId: convergent-ai] [13:41:36.203] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:41:37.274015030Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":23,"sessionAgeMs":393405,"contextItemCount":46,"estimatedContextTokens":1097,"userTurnEndAt":1783518084332}
DEFAULT 2026-07-08T13:41:37.275354105Z [resource.labels.instanceId: convergent-ai] [13:41:37.274] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:41:37.275508406Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_00b9f80a-7c4"
DEFAULT 2026-07-08T13:41:37.275558823Z [resource.labels.instanceId: convergent-ai] message: "Understood, thank you for sharing that. Since being self-employed can sometimes involve different documentation for income verification, a licensed mortgage advisor from your lending institution will be able to walk you through exactly what's needed. "
DEFAULT 2026-07-08T13:41:37.275593233Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:41:37.276737867Z [resource.labels.instanceId: convergent-ai] [13:41:37.276] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:41:46.100213899Z [resource.labels.instanceId: convergent-ai] [13:41:46.099] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:46.423062960Z [resource.labels.instanceId: convergent-ai] [13:41:46.422] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:46.769683375Z [resource.labels.instanceId: convergent-ai] [13:41:46.769] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:47.041555805Z [resource.labels.instanceId: convergent-ai] [13:41:47.040] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:47.041677753Z [resource.labels.instanceId: convergent-ai] transcript: "Okay"
DEFAULT 2026-07-08T13:41:47.062559065Z [resource.labels.instanceId: convergent-ai] [13:41:47.062] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:41:47.062694631Z [resource.labels.instanceId: convergent-ai] transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.065185335Z [resource.labels.instanceId: convergent-ai] [13:41:47.064] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:41:47.065293488Z [resource.labels.instanceId: convergent-ai] user_transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.065322341Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:41:47.065354593Z [resource.labels.instanceId: convergent-ai] [13:41:47.064] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:41:47.065386315Z [resource.labels.instanceId: convergent-ai] transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.227930616Z [resource.labels.instanceId: convergent-ai] [13:41:47.227] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:47.229034435Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:47.228] STT final transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.229278292Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:47.228] STT complete (-1ms): "Okay."
DEFAULT 2026-07-08T13:41:47.231542182Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Okay."
DEFAULT 2026-07-08T13:41:47.231636871Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 22 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:41:47.231670983Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 22 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:41:47.231771587Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:41:47.231975780Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:41:47.232033393Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=stage2_closing_offer
DEFAULT 2026-07-08T13:41:47.232075280Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:41:47.232109241Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:41:47.232139509Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:41:47.232173040Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:41:47.232329310Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:41:47.234404124Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.0ms (corrected=false)
DEFAULT 2026-07-08T13:41:47.234574645Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "stage2_closing_offer" is 1
DEFAULT 2026-07-08T13:41:47.234615324Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([stage2_closing_offer]): START
DEFAULT 2026-07-08T13:41:47.235546695Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":24,"sessionAgeMs":403367,"contextItemCount":47,"estimatedContextTokens":1099,"userTurnEndAt":1783518107228}
DEFAULT 2026-07-08T13:41:47.236542030Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:41:47.239697361Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:47.239] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:41:47.241772030Z [resource.labels.instanceId: convergent-ai] [13:41:47.229] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:41:47.241885210Z [resource.labels.instanceId: convergent-ai] user_transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.241916057Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:41:47.241947905Z [resource.labels.instanceId: convergent-ai] [13:41:47.230] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:41:47.241978558Z [resource.labels.instanceId: convergent-ai] [13:41:47.230] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:41:47.242005923Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Okay."
DEFAULT 2026-07-08T13:41:47.242028920Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:41:47.242058343Z [resource.labels.instanceId: convergent-ai] [13:41:47.230] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:41:47.242085605Z [resource.labels.instanceId: convergent-ai] transcript: "Okay."
DEFAULT 2026-07-08T13:41:47.242125828Z [resource.labels.instanceId: convergent-ai] [13:41:47.231] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:41:47.242155024Z [resource.labels.instanceId: convergent-ai] [13:41:47.232] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:41:47.242180425Z [resource.labels.instanceId: convergent-ai] [13:41:47.232] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:41:47.242214120Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_b27e2d74-478"
DEFAULT 2026-07-08T13:41:47.242245739Z [resource.labels.instanceId: convergent-ai] [13:41:47.232] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:41:47.242278754Z [resource.labels.instanceId: convergent-ai] [13:41:47.233] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:41:47.242306874Z [resource.labels.instanceId: convergent-ai] [13:41:47.234] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:41:47.242335849Z [resource.labels.instanceId: convergent-ai] [13:41:47.235] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:41:47.242365369Z [resource.labels.instanceId: convergent-ai] [13:41:47.238] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:41:47.471439471Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([stage2_closing_offer]): Cerebras call (attempt 1) took 236.8ms
DEFAULT 2026-07-08T13:41:47.471605311Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:41:47.471647161Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([stage2_closing_offer]): TOTAL 236.9ms (content=ok)
DEFAULT 2026-07-08T13:41:47.471677734Z [resource.labels.instanceId: convergent-ai] [context-manager]: stage2_closing_offer accepted! Transitioning to STAGE 3A Soft Pull Consent!
DEFAULT 2026-07-08T13:41:47.471706424Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3A extraction: 237.0ms
DEFAULT 2026-07-08T13:41:47.471737251Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 239.7ms
DEFAULT 2026-07-08T13:41:47.471770464Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 23 extraction finished in 239.7ms.
DEFAULT 2026-07-08T13:41:47.471794427Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 23 background extraction results into state.
DEFAULT 2026-07-08T13:41:47.471831299Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning activeStage: 2 -> 3A
DEFAULT 2026-07-08T13:41:47.471861281Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: stage2_closing_offer -> soft_pull_authorization
DEFAULT 2026-07-08T13:41:47.494370313Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:47.494] First chunk/token received (TTFT: 255ms)
DEFAULT 2026-07-08T13:41:47.495386749Z [resource.labels.instanceId: convergent-ai] [13:41:47.494] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:41:47.501343097Z [resource.labels.instanceId: convergent-ai] [13:41:47.496] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:41:47.501485148Z [resource.labels.instanceId: convergent-ai] [13:41:47.496] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:41:47.501547764Z [resource.labels.instanceId: convergent-ai] [13:41:47.496] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:41:47.524289135Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:41:47.524] Stream complete (Total: 285ms, chunks: 12)
DEFAULT 2026-07-08T13:41:47.524685449Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:47.524] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:41:47.524764633Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:47.524] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:41:47.524821262Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":24,"sessionAgeMs":403656,"contextItemCount":0,"estimatedContextTokens":3877,"ttftMs":260,"userTurnEndAt":1783518107228}
DEFAULT 2026-07-08T13:41:47.524855723Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:47.524] LLM metrics — TTFT=260ms prompt_tokens=3877 completion_tokens=152
DEFAULT 2026-07-08T13:41:47.526496979Z [resource.labels.instanceId: convergent-ai] [13:41:47.525] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:41:47.527414520Z [resource.labels.instanceId: convergent-ai] [13:41:47.526] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:41:47.527523813Z [resource.labels.instanceId: convergent-ai] [13:41:47.526] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:41:47.851528803Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:41:47.851684566Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":24,"sessionAgeMs":403983,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":623,"agentSpeakingAt":1783518107851,"userTurnEndAt":1783518107228}
DEFAULT 2026-07-08T13:41:54.215079331Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:54.214] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:41:54.215213854Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:54.214] ── TURN 24 SUMMARY ── stt_done=? llm_start=? llm_first_token=296ms llm_done=296ms tts_start=? tts_done=6986ms
DEFAULT 2026-07-08T13:41:54.215256191Z [resource.labels.instanceId: convergent-ai] [pipeline][13:41:54.214] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:41:54.217063766Z [resource.labels.instanceId: convergent-ai] [13:41:54.216] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:41:54.217670912Z [resource.labels.instanceId: convergent-ai] [13:41:54.216] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:42:02.052423293Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:01.995707+00:00 convergent-ai CRON[49265]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:42:02.052424748Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:01.997688+00:00 convergent-ai CRON[49264]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:42:26.734219329Z [resource.labels.instanceId: convergent-ai] [13:42:26.733] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:42:27.973559855Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":24,"sessionAgeMs":444104,"contextItemCount":48,"estimatedContextTokens":1303,"userTurnEndAt":1783518107228}
DEFAULT 2026-07-08T13:42:27.980647352Z [resource.labels.instanceId: convergent-ai] [13:42:27.978] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:42:27.980803156Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_b27e2d74-478"
DEFAULT 2026-07-08T13:42:27.980842344Z [resource.labels.instanceId: convergent-ai] message: "We have covered a lot of great ground together, and I now have a solid picture of your financial starting point. Based on what you have shared, I can begin walking you through the loan programs that may be most relevant to your situation. Before we do that — when you are ready, the natural next step is to submit your information for an initial eligibility review. This gives you real, meaningful feedback on your conditional eligibility — including an estimated payment range — before connecting with a licensed mortgage advisor. The payment estimate is generated by the eligibility review using a current representative rate from our rate sheet — so it reflects actual market conditions, not a rough guess. Would you like to move forward with that now, or would you prefer to continue exploring your options first? "
DEFAULT 2026-07-08T13:42:27.980904431Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:42:42.867417379Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:42.867] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:42:42.867502836Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:42.867] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:42:42.867529809Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":25,"sessionAgeMs":458999,"contextItemCount":0,"estimatedContextTokens":2925,"ttftMs":252,"userTurnEndAt":1783518162582}
DEFAULT 2026-07-08T13:42:42.867569368Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:42.867] LLM metrics — TTFT=252ms prompt_tokens=2925 completion_tokens=71
DEFAULT 2026-07-08T13:42:42.869247912Z [resource.labels.instanceId: convergent-ai] [13:42:42.868] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:42:42.871567989Z [resource.labels.instanceId: convergent-ai] [13:42:42.869] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:42:42.871638779Z [resource.labels.instanceId: convergent-ai] [13:42:42.869] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:42:42.873602771Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("soft_pull_consent"): Cerebras call (attempt 1) took 285.4ms
DEFAULT 2026-07-08T13:42:42.873712240Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Classified confirmation for "soft_pull_consent" raw JSON: null
DEFAULT 2026-07-08T13:42:42.873749340Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("soft_pull_consent"): TOTAL 285.5ms (content=ok)
DEFAULT 2026-07-08T13:42:42.873790058Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3A extraction: 285.9ms
DEFAULT 2026-07-08T13:42:42.873820817Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 288.6ms
DEFAULT 2026-07-08T13:42:42.873861427Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 24 extraction finished in 288.6ms.
DEFAULT 2026-07-08T13:42:42.873896444Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 24 background extraction results into state.
DEFAULT 2026-07-08T13:42:42.873942751Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: soft_pull_authorization -> prefill_name_address
DEFAULT 2026-07-08T13:42:43.381327816Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:42:43.381453390Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":25,"sessionAgeMs":459513,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":799,"agentSpeakingAt":1783518163381,"userTurnEndAt":1783518162582}
DEFAULT 2026-07-08T13:42:45.975591825Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:45.975] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:42:45.975714528Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:45.975] ── TURN 25 SUMMARY ── stt_done=? llm_start=? llm_first_token=285ms llm_done=285ms tts_start=? tts_done=3393ms
DEFAULT 2026-07-08T13:42:45.975764193Z [resource.labels.instanceId: convergent-ai] [pipeline][13:42:45.975] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:42:45.977207584Z [resource.labels.instanceId: convergent-ai] [13:42:45.976] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:42:45.977854088Z [resource.labels.instanceId: convergent-ai] [13:42:45.977] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:42:47.052821106Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.002182+00:00 convergent-ai systemd[1]: Starting apt-news.service - Update APT News...
DEFAULT 2026-07-08T13:42:47.052822889Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003323+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052823309Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003550+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052823791Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003655+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052824222Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003727+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052824558Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003801+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052824902Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003890+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052825336Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.003939+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052825685Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004000+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052826Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004079+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052826349Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004139+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052828832Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004179+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052829264Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004234+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052829606Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004282+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052830002Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004354+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052830349Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004395+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052830607Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004446+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052830883Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004507+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052831234Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004546+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052831656Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004585+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:42:47.052832146Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004623+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052832496Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.004661+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:43:17 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:42:47.052832837Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.007122+00:00 convergent-ai systemd[1]: Starting esm-cache.service - Update the local ESM caches...
DEFAULT 2026-07-08T13:42:47.252661844Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.214075+00:00 convergent-ai systemd[1]: apt-news.service: Deactivated successfully.
DEFAULT 2026-07-08T13:42:47.252663284Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.214395+00:00 convergent-ai systemd[1]: Finished apt-news.service - Update APT News.
DEFAULT 2026-07-08T13:42:47.652548932Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.598652+00:00 convergent-ai dbus-daemon[615]: [system] Activating via systemd: service name='org.freedesktop.PackageKit' unit='packagekit.service' requested by ':1.378' (uid=0 pid=49564 comm="/usr/bin/gdbus call --system --dest org.freedeskto" label="unconfined")
DEFAULT 2026-07-08T13:42:47.652551042Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.605822+00:00 convergent-ai systemd[1]: Starting packagekit.service - PackageKit Daemon...
DEFAULT 2026-07-08T13:42:47.652551303Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.609853+00:00 convergent-ai PackageKit: daemon start
DEFAULT 2026-07-08T13:42:47.652551579Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.629986+00:00 convergent-ai dbus-daemon[615]: [system] Successfully activated service 'org.freedesktop.PackageKit'
DEFAULT 2026-07-08T13:42:47.652551786Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.630163+00:00 convergent-ai systemd[1]: Started packagekit.service - PackageKit Daemon.
DEFAULT 2026-07-08T13:42:48.052628651Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.855065+00:00 convergent-ai systemd[1]: esm-cache.service: Deactivated successfully.
DEFAULT 2026-07-08T13:42:48.052629776Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:42:47.855311+00:00 convergent-ai systemd[1]: Finished esm-cache.service - Update the local ESM caches.
DEBUG 2026-07-08T13:42:48.901086326Z [resource.labels.instanceId: convergent-ai] {"code":"LogPingOpsAgent"}
DEFAULT 2026-07-08T13:43:00.444224443Z [resource.labels.instanceId: convergent-ai] [13:43:00.443] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:43:01.552031936Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":25,"sessionAgeMs":477683,"contextItemCount":50,"estimatedContextTokens":1397,"userTurnEndAt":1783518162582}
DEFAULT 2026-07-08T13:43:01.553272487Z [resource.labels.instanceId: convergent-ai] [13:43:01.552] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:43:01.553369211Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_d3c97902-d90"
DEFAULT 2026-07-08T13:43:01.553406458Z [resource.labels.instanceId: convergent-ai] message: "Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis? "
DEFAULT 2026-07-08T13:43:01.553551928Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:43:01.555258492Z [resource.labels.instanceId: convergent-ai] [13:43:01.554] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:43:02.052842386Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:43:02.002731+00:00 convergent-ai CRON[49678]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:43:02.052844947Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:43:02.005119+00:00 convergent-ai CRON[49677]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:43:09.230745384Z [resource.labels.instanceId: convergent-ai] [13:43:09.230] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:09.461456482Z [resource.labels.instanceId: convergent-ai] [13:43:09.460] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:10.252548573Z [resource.labels.instanceId: convergent-ai] [13:43:10.251] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:10.252682468Z [resource.labels.instanceId: convergent-ai] transcript: "Yes"
DEFAULT 2026-07-08T13:43:10.417919742Z [resource.labels.instanceId: convergent-ai] [13:43:10.417] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:10.418032865Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, are"
DEFAULT 2026-07-08T13:43:10.584144972Z [resource.labels.instanceId: convergent-ai] [13:43:10.583] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:10.584263422Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, are you"
DEFAULT 2026-07-08T13:43:10.606280764Z [resource.labels.instanceId: convergent-ai] [13:43:10.605] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:10.606414991Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.608682070Z [resource.labels.instanceId: convergent-ai] [13:43:10.607] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:43:10.608818015Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.608861003Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:43:10.608894731Z [resource.labels.instanceId: convergent-ai] [13:43:10.608] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:43:10.608931568Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.739596408Z [resource.labels.instanceId: convergent-ai] [13:43:10.739] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:10.751042890Z [resource.labels.instanceId: convergent-ai] [13:43:10.750] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:10.752188385Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:10.752] STT final transcript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.752299260Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:10.752] STT complete (-1ms): "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.754536266Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.754636561Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 24 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:43:10.754677484Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 24 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:43:10.754738861Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:43:10.755001480Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:43:10.755070840Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3A, pendingField=prefill_name_address
DEFAULT 2026-07-08T13:43:10.755120867Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:43:10.755167361Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:43:10.755211576Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:43:10.755251050Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:43:10.755307204Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:43:10.757492974Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.1ms (corrected=false)
DEFAULT 2026-07-08T13:43:10.757567441Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "prefill_name_address" is 1
DEFAULT 2026-07-08T13:43:10.757606212Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("prefill_name_address"): START
DEFAULT 2026-07-08T13:43:10.758700505Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":26,"sessionAgeMs":486890,"contextItemCount":51,"estimatedContextTokens":1403,"userTurnEndAt":1783518190752}
DEFAULT 2026-07-08T13:43:10.759493471Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:43:10.762551656Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:43:10.762] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:43:10.764553991Z [resource.labels.instanceId: convergent-ai] [13:43:10.752] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:43:10.764650882Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.764716136Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:43:10.764755953Z [resource.labels.instanceId: convergent-ai] [13:43:10.753] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:10.764797954Z [resource.labels.instanceId: convergent-ai] [13:43:10.753] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:43:10.764839203Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yes, are you authorized?"
DEFAULT 2026-07-08T13:43:10.764860892Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:43:10.764880809Z [resource.labels.instanceId: convergent-ai] [13:43:10.753] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:43:10.999437508Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("prefill_name_address"): TOTAL 241.7ms (content=ok)
DEFAULT 2026-07-08T13:43:10.999500309Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3A extraction: 241.8ms
DEFAULT 2026-07-08T13:43:10.999589696Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 244.7ms
DEFAULT 2026-07-08T13:43:10.999635020Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 25 extraction finished in 244.7ms.
DEFAULT 2026-07-08T13:43:10.999695609Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 25 background extraction results into state.
DEFAULT 2026-07-08T13:43:10.999730451Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: prefill_name_address -> prefill_employer
DEFAULT 2026-07-08T13:43:11.128099255Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:43:11.127] Stream complete (Total: 365ms, chunks: 28)
DEFAULT 2026-07-08T13:43:11.128551106Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:11.128] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:43:11.128622718Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:11.128] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:43:11.128657451Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":26,"sessionAgeMs":487260,"contextItemCount":0,"estimatedContextTokens":3030,"ttftMs":232,"userTurnEndAt":1783518190752}
DEFAULT 2026-07-08T13:43:11.128699501Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:11.128] LLM metrics — TTFT=232ms prompt_tokens=3030 completion_tokens=104
DEFAULT 2026-07-08T13:43:11.130148249Z [resource.labels.instanceId: convergent-ai] [13:43:11.129] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:43:11.131242519Z [resource.labels.instanceId: convergent-ai] [13:43:11.130] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:43:11.131317219Z [resource.labels.instanceId: convergent-ai] [13:43:11.130] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:43:11.316449078Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:43:11.316600020Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":26,"sessionAgeMs":487448,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":564,"agentSpeakingAt":1783518191316,"userTurnEndAt":1783518190752}
DEFAULT 2026-07-08T13:43:15.993037570Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:15.992] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:43:15.993165824Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:15.992] ── TURN 26 SUMMARY ── stt_done=? llm_start=? llm_first_token=376ms llm_done=376ms tts_start=? tts_done=5240ms
DEFAULT 2026-07-08T13:43:15.993215359Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:15.992] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:43:15.994900755Z [resource.labels.instanceId: convergent-ai] [13:43:15.994] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:43:15.995522459Z [resource.labels.instanceId: convergent-ai] [13:43:15.994] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:43:38.144010676Z [resource.labels.instanceId: convergent-ai] [13:43:38.143] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:43:39.286892487Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":26,"sessionAgeMs":515418,"contextItemCount":52,"estimatedContextTokens":1510,"userTurnEndAt":1783518190752}
DEFAULT 2026-07-08T13:43:39.288147551Z [resource.labels.instanceId: convergent-ai] [13:43:39.287] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:43:39.288271400Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_841c592e-009"
DEFAULT 2026-07-08T13:43:39.288319065Z [resource.labels.instanceId: convergent-ai] message: "I am an AI assistant designed to guide you through this process, and your \"yes\" provides the authorization needed for your lending institution to perform the soft pull. We've successfully retrieved your information to save you some typing. First, let's check your contact details: we have your name as John Doe, located at 1234 Maple Avenue, Suite 100, Los Angeles, CA 90012. Does that look right, or is anything out of date? "
DEFAULT 2026-07-08T13:43:39.288377532Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:43:39.289591615Z [resource.labels.instanceId: convergent-ai] [13:43:39.289] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:43:47.380478535Z [resource.labels.instanceId: convergent-ai] [13:43:47.379] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:47.552724482Z [resource.labels.instanceId: convergent-ai] [13:43:47.552] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:48.352262666Z [resource.labels.instanceId: convergent-ai] [13:43:48.351] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:48.352389487Z [resource.labels.instanceId: convergent-ai] transcript: "yeah"
DEFAULT 2026-07-08T13:43:48.497529221Z [resource.labels.instanceId: convergent-ai] [13:43:48.496] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:48.498264181Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it"
DEFAULT 2026-07-08T13:43:48.997038656Z [resource.labels.instanceId: convergent-ai] [13:43:48.996] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:48.997166109Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks"
DEFAULT 2026-07-08T13:43:49.455066817Z [resource.labels.instanceId: convergent-ai] [13:43:49.454] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:49.455204571Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right"
DEFAULT 2026-07-08T13:43:50.119731099Z [resource.labels.instanceId: convergent-ai] [13:43:50.119] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:50.119859822Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every"
DEFAULT 2026-07-08T13:43:50.740678999Z [resource.labels.instanceId: convergent-ai] [13:43:50.740] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:50.740832152Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information"
DEFAULT 2026-07-08T13:43:50.906115207Z [resource.labels.instanceId: convergent-ai] [13:43:50.905] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:50.906245229Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is"
DEFAULT 2026-07-08T13:43:51.239981723Z [resource.labels.instanceId: convergent-ai] [13:43:51.239] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:51.240107280Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct"
DEFAULT 2026-07-08T13:43:51.716343711Z [resource.labels.instanceId: convergent-ai] [13:43:51.715] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:51.716458431Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct what"
DEFAULT 2026-07-08T13:43:51.861434088Z [resource.labels.instanceId: convergent-ai] [13:43:51.860] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:51.861598040Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct what you"
DEFAULT 2026-07-08T13:43:51.882514532Z [resource.labels.instanceId: convergent-ai] [13:43:51.881] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:43:51.882660147Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:51.903875545Z [resource.labels.instanceId: convergent-ai] [13:43:51.903] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:43:51.904019803Z [resource.labels.instanceId: convergent-ai] user_transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:51.904070800Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:43:51.904755449Z [resource.labels.instanceId: convergent-ai] [13:43:51.903] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:43:51.904869804Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.028075094Z [resource.labels.instanceId: convergent-ai] [13:43:52.027] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:52.029193555Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:52.029] STT final transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.029305499Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:52.029] STT complete (-1ms): "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.032635815Z [resource.labels.instanceId: convergent-ai] [13:43:52.029] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:43:52.032728136Z [resource.labels.instanceId: convergent-ai] user_transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.032772857Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:43:52.032807156Z [resource.labels.instanceId: convergent-ai] [13:43:52.030] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:43:52.032845201Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518227315.481
DEFAULT 2026-07-08T13:43:52.032882872Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:43:52.032930493Z [resource.labels.instanceId: convergent-ai] [13:43:52.031] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:43:52.032960816Z [resource.labels.instanceId: convergent-ai] [13:43:52.031] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:43:52.032999061Z [resource.labels.instanceId: convergent-ai] audioTranscript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.033028008Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:43:52.080726014Z [resource.labels.instanceId: convergent-ai] [13:43:52.080] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:43:52.080866813Z [resource.labels.instanceId: convergent-ai] transcript: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.081505070Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "yeah, it looks right. every information is correct what you just stated."
DEFAULT 2026-07-08T13:43:52.081589198Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 25 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:43:52.081629243Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 25 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:43:52.081838034Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:43:52.082072566Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:43:52.082130678Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3A, pendingField=prefill_employer
DEFAULT 2026-07-08T13:43:52.082216542Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.2ms
DEFAULT 2026-07-08T13:43:52.082252447Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:43:52.082285105Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:43:52.082311743Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:43:52.082380416Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:43:52.082602669Z [resource.labels.instanceId: convergent-ai] [context-manager] Global: Checking potential correction against confirmed fields: borrower_name, mortgage_goal, occupancy, existing_relationship, timeline, co_borrower, gross_annual_income, monthly_debt, credit_range, down_payment, rent_own, realtor_status, target_price, property_type, military_rural, job_tenure_type
DEFAULT 2026-07-08T13:43:52.083060217Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("global_correction"): START (running concurrent with main LLM if race not yet resolved)
DEFAULT 2026-07-08T13:43:52.086832944Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":27,"sessionAgeMs":528218,"contextItemCount":53,"estimatedContextTokens":1528,"userTurnEndAt":1783518232029}
DEFAULT 2026-07-08T13:43:52.087562141Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:43:52.090103512Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:43:52.089] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:43:52.092320545Z [resource.labels.instanceId: convergent-ai] [13:43:52.080] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:43:52.092429598Z [resource.labels.instanceId: convergent-ai] [13:43:52.082] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:43:52.092480149Z [resource.labels.instanceId: convergent-ai] [13:43:52.083] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:43:52.092515479Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_452a4a06-39e"
DEFAULT 2026-07-08T13:43:52.092550751Z [resource.labels.instanceId: convergent-ai] [13:43:52.083] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:43:52.092581933Z [resource.labels.instanceId: convergent-ai] [13:43:52.083] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:43:52.092614895Z [resource.labels.instanceId: convergent-ai] [13:43:52.085] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:43:52.092643211Z [resource.labels.instanceId: convergent-ai] [13:43:52.087] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:43:52.092676988Z [resource.labels.instanceId: convergent-ai] [13:43:52.089] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:43:52.278267572Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:43:52.278] First chunk/token received (TTFT: 189ms)
DEFAULT 2026-07-08T13:43:52.303176802Z [resource.labels.instanceId: convergent-ai] [13:43:52.302] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:43:52.306290296Z [resource.labels.instanceId: convergent-ai] [13:43:52.303] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:43:52.306420562Z [resource.labels.instanceId: convergent-ai] [13:43:52.304] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:43:52.306487036Z [resource.labels.instanceId: convergent-ai] [13:43:52.304] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:43:52.333222215Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:43:52.333] Stream complete (Total: 244ms, chunks: 9)
DEFAULT 2026-07-08T13:43:52.333584546Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:52.333] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:43:52.333692259Z [resource.labels.instanceId: convergent-ai] [pipeline][13:43:52.333] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:43:52.333744608Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":27,"sessionAgeMs":528465,"contextItemCount":0,"estimatedContextTokens":3155,"ttftMs":217,"userTurnEndAt":1783518232029}
DEFAULT 2026-07-08T13:44:22.543982641Z [resource.labels.instanceId: convergent-ai] [13:44:22.543] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:44:22.544722819Z [resource.labels.instanceId: convergent-ai] [13:44:22.543] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:44:22.544814891Z [resource.labels.instanceId: convergent-ai] [13:44:22.544] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:44:22.991962327Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:44:22.992099407Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":28,"sessionAgeMs":559123,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":722,"agentSpeakingAt":1783518262991,"userTurnEndAt":1783518262269}
DEFAULT 2026-07-08T13:44:23.495927339Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:44:24.783107986Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:24.782] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:44:24.783230239Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:24.782] ── TURN 28 SUMMARY ── stt_done=? llm_start=? llm_first_token=273ms llm_done=273ms tts_start=? tts_done=2513ms
DEFAULT 2026-07-08T13:44:24.783272491Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:24.782] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:44:24.784772097Z [resource.labels.instanceId: convergent-ai] [13:44:24.784] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:44:24.785377979Z [resource.labels.instanceId: convergent-ai] [13:44:24.784] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:44:34.134273993Z [resource.labels.instanceId: convergent-ai] [13:44:34.133] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:44:35.206951395Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":28,"sessionAgeMs":571338,"contextItemCount":56,"estimatedContextTokens":1621,"userTurnEndAt":1783518262269}
DEFAULT 2026-07-08T13:44:35.208185563Z [resource.labels.instanceId: convergent-ai] [13:44:35.207] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:44:35.208356674Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_9f260b84-be1"
DEFAULT 2026-07-08T13:44:35.208398537Z [resource.labels.instanceId: convergent-ai] message: "Perfect. Now, looking at your accounts summary, we see 2 open active credit cards, 1 auto loan, and no negative accounts or late payments in the last 24 months. Does that look right, or is anything out of date? "
DEFAULT 2026-07-08T13:44:35.208513976Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:44:35.208688623Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":1621,"itemCount":56,"action":"compact_start","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:44:35.210392975Z [resource.labels.instanceId: convergent-ai] [13:44:35.209] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:44:35.506116371Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"context_compaction","itemsBefore":56,"itemsAfter":10,"turnNumber":28,"sessionAgeMs":571637}
DEFAULT 2026-07-08T13:44:35.506233961Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":28,"sessionAgeMs":571637,"contextItemCount":10,"estimatedContextTokens":542,"userTurnEndAt":1783518262269}
DEFAULT 2026-07-08T13:44:35.506278718Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":542,"itemCount":10,"action":"compact_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:44:35.506324931Z [resource.labels.instanceId: convergent-ai] [context]: Compacted 56Ã¢â€ â€™10 items, ~1621Ã¢â€ â€™542 text tokens (last API input: 0)
DEFAULT 2026-07-08T13:44:48.559908102Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:44:50.392078565Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:44:50.563015044Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:44:51.929775144Z [resource.labels.instanceId: convergent-ai] [13:44:51.929] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:44:52.208643838Z [resource.labels.instanceId: convergent-ai] [13:44:52.208] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:44:52.395977841Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:44:52.828031903Z [resource.labels.instanceId: convergent-ai] [13:44:52.827] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:44:52.828166956Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:44:53.062959828Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:44:53.158549640Z [resource.labels.instanceId: convergent-ai] [13:44:53.158] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:44:53.158700665Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes"
DEFAULT 2026-07-08T13:44:53.489267704Z [resource.labels.instanceId: convergent-ai] [13:44:53.488] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:44:53.489391147Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes,"
DEFAULT 2026-07-08T13:44:53.510012804Z [resource.labels.instanceId: convergent-ai] [13:44:53.509] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:44:53.510146773Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that looks right"
DEFAULT 2026-07-08T13:44:53.530965212Z [resource.labels.instanceId: convergent-ai] [13:44:53.530] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:44:53.531110858Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.532994841Z [resource.labels.instanceId: convergent-ai] [13:44:53.532] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:44:53.533114757Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.533158219Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:44:53.533200495Z [resource.labels.instanceId: convergent-ai] [13:44:53.532] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:44:53.533234141Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.559591495Z [resource.labels.instanceId: convergent-ai] [13:44:53.559] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:44:53.613184857Z [resource.labels.instanceId: convergent-ai] [13:44:53.612] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:44:53.614243208Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:53.614] STT final transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.614325822Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:53.614] STT complete (-1ms): "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.616493485Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.616608928Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 27 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:44:53.616650153Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 27 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:44:53.616718860Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:44:53.616973576Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:44:53.617036310Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3A, pendingField=prefill_credit_range
DEFAULT 2026-07-08T13:44:53.617082657Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:44:53.617118932Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:44:53.617159370Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:44:53.617204391Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:44:53.617317659Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:44:53.619309805Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 1.9ms (corrected=false)
DEFAULT 2026-07-08T13:44:53.619407724Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "prefill_credit_range" is 1
DEFAULT 2026-07-08T13:44:53.619515114Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("prefill_credit_range"): START
DEFAULT 2026-07-08T13:44:53.620384568Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":29,"sessionAgeMs":589752,"contextItemCount":57,"estimatedContextTokens":1627,"userTurnEndAt":1783518293614}
DEFAULT 2026-07-08T13:44:53.621069239Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:44:53.624573080Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:44:53.624] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:44:53.627133758Z [resource.labels.instanceId: convergent-ai] [13:44:53.614] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:44:53.627278648Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.627332068Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:44:53.627389490Z [resource.labels.instanceId: convergent-ai] [13:44:53.615] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:44:53.627438693Z [resource.labels.instanceId: convergent-ai] [13:44:53.615] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:44:53.627490772Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.627530374Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:44:53.627563043Z [resource.labels.instanceId: convergent-ai] [13:44:53.615] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:44:53.627587710Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yes, that looks right."
DEFAULT 2026-07-08T13:44:53.627607759Z [resource.labels.instanceId: convergent-ai] [13:44:53.616] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:44:53.627640636Z [resource.labels.instanceId: convergent-ai] [13:44:53.617] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:44:53.627673202Z [resource.labels.instanceId: convergent-ai] [13:44:53.617] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:44:53.627700946Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_cc0c6aa7-6bd"
DEFAULT 2026-07-08T13:44:53.627736707Z [resource.labels.instanceId: convergent-ai] [13:44:53.617] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:44:53.627801951Z [resource.labels.instanceId: convergent-ai] [13:44:53.618] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:44:53.627839211Z [resource.labels.instanceId: convergent-ai] [13:44:53.619] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:44:53.627870353Z [resource.labels.instanceId: convergent-ai] [13:44:53.620] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:44:53.627898211Z [resource.labels.instanceId: convergent-ai] [13:44:53.623] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:44:53.822708033Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:44:53.822] First chunk/token received (TTFT: 198ms)
DEFAULT 2026-07-08T13:44:53.840630480Z [resource.labels.instanceId: convergent-ai] [13:44:53.840] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:44:53.843859005Z [resource.labels.instanceId: convergent-ai] [13:44:53.841] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:44:53.843979036Z [resource.labels.instanceId: convergent-ai] [13:44:53.841] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:44:53.844020383Z [resource.labels.instanceId: convergent-ai] [13:44:53.841] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:44:53.858881945Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("prefill_credit_range"): Cerebras call (attempt 1) took 239.4ms
DEFAULT 2026-07-08T13:44:53.859015145Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Classified confirmation for "prefill_credit_range" raw JSON: null
DEFAULT 2026-07-08T13:44:53.859053636Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("prefill_credit_range"): TOTAL 239.5ms (content=ok)
DEFAULT 2026-07-08T13:44:53.859090268Z [resource.labels.instanceId: convergent-ai] [context-manager]: Ã¢Å“â€¦ Prefills confirmed! Transitioning to STAGE 3B!
DEFAULT 2026-07-08T13:44:53.859130635Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3B extraction: 239.6ms
DEFAULT 2026-07-08T13:44:53.859163700Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 242.2ms
DEFAULT 2026-07-08T13:44:53.859203170Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 28 extraction finished in 242.2ms.
DEFAULT 2026-07-08T13:44:53.859237053Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 28 background extraction results into state.
DEFAULT 2026-07-08T13:44:53.859282661Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning activeStage: 3A -> 3B
DEFAULT 2026-07-08T13:44:53.859326661Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: prefill_credit_range -> marital_status
DEFAULT 2026-07-08T13:44:53.862966742Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:44:53.862] Stream complete (Total: 238ms, chunks: 8)
DEFAULT 2026-07-08T13:44:53.863865936Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:53.863] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:44:53.863957587Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:53.863] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:44:53.863979435Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":29,"sessionAgeMs":589995,"contextItemCount":0,"estimatedContextTokens":2868,"ttftMs":221,"userTurnEndAt":1783518293614}
DEFAULT 2026-07-08T13:44:53.864540151Z [resource.labels.instanceId: convergent-ai] [pipeline][13:44:53.863] LLM metrics — TTFT=221ms prompt_tokens=2868 completion_tokens=36
DEFAULT 2026-07-08T13:44:53.865222346Z [resource.labels.instanceId: convergent-ai] [13:44:53.864] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:44:53.865917760Z [resource.labels.instanceId: convergent-ai] [13:44:53.865] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:44:53.865985003Z [resource.labels.instanceId: convergent-ai] [13:44:53.865] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:45:29.287492595Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":30,"sessionAgeMs":625419,"contextItemCount":60,"estimatedContextTokens":1738,"userTurnEndAt":1783518315867}
DEFAULT 2026-07-08T13:45:29.288663752Z [resource.labels.instanceId: convergent-ai] [13:45:29.288] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:45:29.288765380Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_9e064bfa-1bf"
DEFAULT 2026-07-08T13:45:29.288809219Z [resource.labels.instanceId: convergent-ai] message: "That's great to hear. Now that we've confirmed those details, I'd like to walk through a few remaining items for your application—this helps us make sure everything is accurate before we send it for review. To start, what is your current marital status? "
DEFAULT 2026-07-08T13:45:29.288857633Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:45:29.290765482Z [resource.labels.instanceId: convergent-ai] [13:45:29.290] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:45:29.802669161Z [resource.labels.instanceId: convergent-ai] [agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT/TTS)...
DEFAULT 2026-07-08T13:45:29.804025705Z [resource.labels.instanceId: convergent-ai] [13:45:29.803] [34mDEBUG[39m (102): [36mTask.runTask: task AgentSession_updateActivityTask started[39m
DEFAULT 2026-07-08T13:45:29.804433217Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"session_rotation","reason":"scheduled","turnNumber":30,"sessionAgeMs":625936}
DEFAULT 2026-07-08T13:45:29.804528971Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":null,"itemCount":60,"action":"rotation_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:45:29.804640359Z [resource.labels.instanceId: convergent-ai] [context]: Session rotated (static instructions, summary in chat ctx only)
DEFAULT 2026-07-08T13:45:29.920017476Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":30,"sessionAgeMs":626051,"contextItemCount":61,"estimatedContextTokens":1738,"userTurnEndAt":1783518315867}
DEFAULT 2026-07-08T13:45:29.926841177Z [resource.labels.instanceId: convergent-ai] [13:45:29.805] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onExit started[39m
DEFAULT 2026-07-08T13:45:29.926944087Z [resource.labels.instanceId: convergent-ai] [13:45:29.806] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onExit done[39m
DEFAULT 2026-07-08T13:45:29.926968707Z [resource.labels.instanceId: convergent-ai] [13:45:29.806] [32mINFO[39m (102): [36mmainTask: scheduling paused and no more speech tasks to wait[39m
DEFAULT 2026-07-08T13:45:29.927016234Z [resource.labels.instanceId: convergent-ai] [13:45:29.806] [32mINFO[39m (102): [36mAgentActivity mainTask: exiting[39m
DEFAULT 2026-07-08T13:45:29.927054634Z [resource.labels.instanceId: convergent-ai] [13:45:29.918] [34mDEBUG[39m (102): [36mVAD task closed[39m
DEFAULT 2026-07-08T13:45:29.927089326Z [resource.labels.instanceId: convergent-ai] [13:45:29.920] [34mDEBUG[39m (102): [36mAgent handoff inserted into chat context[39m
DEFAULT 2026-07-08T13:45:29.927114522Z [resource.labels.instanceId: convergent-ai] previousAgentId: "ailana_voice_agent"
DEFAULT 2026-07-08T13:45:29.927146935Z [resource.labels.instanceId: convergent-ai] newAgentId: "ailana_voice_agent"
DEFAULT 2026-07-08T13:45:29.927189876Z [resource.labels.instanceId: convergent-ai] [13:45:29.923] [34mDEBUG[39m (102): [36mreusing STT pipeline from previous activity[39m
DEFAULT 2026-07-08T13:45:29.927224804Z [resource.labels.instanceId: convergent-ai] [13:45:29.924] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onEnter started[39m
DEFAULT 2026-07-08T13:45:29.927258045Z [resource.labels.instanceId: convergent-ai] [13:45:29.925] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity_onEnter done[39m
DEFAULT 2026-07-08T13:45:29.927305746Z [resource.labels.instanceId: convergent-ai] [13:45:29.925] [34mDEBUG[39m (102): [36mTask.runTask: task AgentSession_updateActivityTask done[39m
DEFAULT 2026-07-08T13:45:42.479425139Z [resource.labels.instanceId: convergent-ai] [13:45:42.478] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:45:42.757404420Z [resource.labels.instanceId: convergent-ai] [13:45:42.756] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:45:43.401297777Z [resource.labels.instanceId: convergent-ai] [13:45:43.400] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:45:43.401421238Z [resource.labels.instanceId: convergent-ai] transcript: "I'"
DEFAULT 2026-07-08T13:45:43.421316083Z [resource.labels.instanceId: convergent-ai] [13:45:43.420] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:45:43.421437449Z [resource.labels.instanceId: convergent-ai] transcript: "I'm"
DEFAULT 2026-07-08T13:45:43.879392850Z [resource.labels.instanceId: convergent-ai] [13:45:43.878] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:45:43.879532784Z [resource.labels.instanceId: convergent-ai] transcript: "I'm single"
DEFAULT 2026-07-08T13:45:43.900642151Z [resource.labels.instanceId: convergent-ai] [13:45:43.900] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:45:43.900779062Z [resource.labels.instanceId: convergent-ai] transcript: "I'm single at the moment"
DEFAULT 2026-07-08T13:45:43.922481253Z [resource.labels.instanceId: convergent-ai] [13:45:43.922] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:45:43.922590526Z [resource.labels.instanceId: convergent-ai] transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:43.924381566Z [resource.labels.instanceId: convergent-ai] [13:45:43.923] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:45:43.924505425Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:43.924545998Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:45:43.924582728Z [resource.labels.instanceId: convergent-ai] [13:45:43.924] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:45:43.924636818Z [resource.labels.instanceId: convergent-ai] transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.012956567Z [resource.labels.instanceId: convergent-ai] [13:45:44.012] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:45:44.014186634Z [resource.labels.instanceId: convergent-ai] [pipeline][13:45:44.014] STT final transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.014305834Z [resource.labels.instanceId: convergent-ai] [pipeline][13:45:44.014] STT complete (-1ms): "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.017195536Z [resource.labels.instanceId: convergent-ai] [13:45:44.014] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:45:44.017283686Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.017319054Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:45:44.017354732Z [resource.labels.instanceId: convergent-ai] [13:45:44.015] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:45:44.017392113Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518342414.756
DEFAULT 2026-07-08T13:45:44.017427437Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:45:44.017475748Z [resource.labels.instanceId: convergent-ai] [13:45:44.016] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:45:44.017544354Z [resource.labels.instanceId: convergent-ai] [13:45:44.016] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:45:44.017584047Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.017619537Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:45:44.078355700Z [resource.labels.instanceId: convergent-ai] [13:45:44.077] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:45:44.078497158Z [resource.labels.instanceId: convergent-ai] transcript: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.078883149Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I'm single at the moment."
DEFAULT 2026-07-08T13:45:44.079023197Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 29 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:45:44.079069443Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 29 extraction resolved normally. Waited: 0.1ms
DEFAULT 2026-07-08T13:45:44.079306699Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:45:44.079576558Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:45:44.079675625Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3B, pendingField=marital_status
DEFAULT 2026-07-08T13:45:44.079713805Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:45:44.080569694Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:45:44.080639753Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:45:44.080673386Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:45:44.080704765Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:45:44.082182729Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.3ms (corrected=false)
DEFAULT 2026-07-08T13:45:44.082257567Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "marital_status" is 2
DEFAULT 2026-07-08T13:45:44.082289851Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("marital_status"): START (running concurrent with main LLM if race not yet resolved)
DEFAULT 2026-07-08T13:45:44.083221200Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":31,"sessionAgeMs":640215,"contextItemCount":63,"estimatedContextTokens":1744,"userTurnEndAt":1783518344014}
DEFAULT 2026-07-08T13:45:44.084048408Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:45:44.087815840Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:45:44.087] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:45:44.090455275Z [resource.labels.instanceId: convergent-ai] [13:45:44.078] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:45:44.090542531Z [resource.labels.instanceId: convergent-ai] [13:45:44.079] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:45:44.090575182Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_197b88c1-4d4"
DEFAULT 2026-07-08T13:45:44.090605399Z [resource.labels.instanceId: convergent-ai] [13:45:44.080] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:45:44.090639537Z [resource.labels.instanceId: convergent-ai] [13:45:44.080] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:45:44.090682236Z [resource.labels.instanceId: convergent-ai] [13:45:44.082] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:45:44.090714404Z [resource.labels.instanceId: convergent-ai] [13:45:44.082] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:45:44.090752527Z [resource.labels.instanceId: convergent-ai] [13:45:44.083] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:45:44.090788971Z [resource.labels.instanceId: convergent-ai] [13:45:44.087] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:45:44.326133611Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:45:44.325] First chunk/token received (TTFT: 238ms)
DEFAULT 2026-07-08T13:45:44.326999362Z [resource.labels.instanceId: convergent-ai] [13:45:44.326] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:45:44.331527630Z [resource.labels.instanceId: convergent-ai] [13:45:44.327] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:45:44.331648298Z [resource.labels.instanceId: convergent-ai] [13:45:44.327] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:45:44.331686371Z [resource.labels.instanceId: convergent-ai] [13:45:44.327] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:45:44.333946529Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:45:44.333] Stream complete (Total: 246ms, chunks: 7)
DEFAULT 2026-07-08T13:45:44.334236136Z [resource.labels.instanceId: convergent-ai] [pipeline][13:45:44.334] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:45:44.334313911Z [resource.labels.instanceId: convergent-ai] [pipeline][13:45:44.334] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:45:44.334356928Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":31,"sessionAgeMs":640466,"contextItemCount":0,"estimatedContextTokens":2814,"ttftMs":244,"userTurnEndAt":1783518344014}
DEFAULT 2026-07-08T13:45:44.334393434Z [resource.labels.instanceId: convergent-ai] [pipeline][13:45:44.334] LLM metrics — TTFT=244ms prompt_tokens=2814 completion_tokens=16
DEFAULT 2026-07-08T13:45:44.335839999Z [resource.labels.instanceId: convergent-ai] [13:45:44.335] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:45:44.336422578Z [resource.labels.instanceId: convergent-ai] [13:45:44.335] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:45:44.336520729Z [resource.labels.instanceId: convergent-ai] [13:45:44.335] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:45:44.381085044Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("marital_status"): Cerebras call (attempt 1) took 298.7ms
DEFAULT 2026-07-08T13:45:44.381195975Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted "marital_status" raw JSON: null
DEFAULT 2026-07-08T13:45:44.381218616Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("marital_status"): TOTAL 298.8ms (content=ok)
DEFAULT 2026-07-08T13:45:44.381252340Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3B extraction: 298.9ms
DEFAULT 2026-07-08T13:45:44.381300150Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 301.8ms
DEFAULT 2026-07-08T13:45:44.381334030Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 30 extraction finished in 301.8ms.
DEFAULT 2026-07-08T13:45:44.381398238Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 30 background extraction results into state.
DEFAULT 2026-07-08T13:45:44.381476719Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: marital_status -> dependents
DEFAULT 2026-07-08T13:45:44.654349991Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:46:35.848599401Z [resource.labels.instanceId: convergent-ai] transcript: "It's full stack"
DEFAULT 2026-07-08T13:46:35.869422128Z [resource.labels.instanceId: convergent-ai] [13:46:35.869] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:46:35.869544964Z [resource.labels.instanceId: convergent-ai] transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:35.871517771Z [resource.labels.instanceId: convergent-ai] [13:46:35.870] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:46:35.871617259Z [resource.labels.instanceId: convergent-ai] user_transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:35.871660374Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:46:35.871690489Z [resource.labels.instanceId: convergent-ai] [13:46:35.871] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:46:35.871720556Z [resource.labels.instanceId: convergent-ai] transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:35.959834427Z [resource.labels.instanceId: convergent-ai] [13:46:35.959] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:46:36.014205705Z [resource.labels.instanceId: convergent-ai] [13:46:36.013] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:46:36.015407032Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:36.015] STT final transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.015523284Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:36.015] STT complete (-1ms): "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.017652379Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.017763412Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 31 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:46:36.017799024Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 31 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:46:36.017951714Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:46:36.018191901Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:46:36.018248809Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3B, pendingField=employment_details
DEFAULT 2026-07-08T13:46:36.018281924Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:46:36.018548881Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:46:36.018629155Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:46:36.018670086Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.7ms
DEFAULT 2026-07-08T13:46:36.018702970Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:46:36.020761753Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.1ms (corrected=false)
DEFAULT 2026-07-08T13:46:36.020822455Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "employment_details" is 1
DEFAULT 2026-07-08T13:46:36.020877195Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([employment_position, employment_years]): START
DEFAULT 2026-07-08T13:46:36.021975012Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":33,"sessionAgeMs":692153,"contextItemCount":66,"estimatedContextTokens":1803,"userTurnEndAt":1783518396015}
DEFAULT 2026-07-08T13:46:36.022679943Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:46:36.026072102Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:46:36.025] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:46:36.028170629Z [resource.labels.instanceId: convergent-ai] [13:46:36.015] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:46:36.028266956Z [resource.labels.instanceId: convergent-ai] user_transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.028309819Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:46:36.028340979Z [resource.labels.instanceId: convergent-ai] [13:46:36.016] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:46:36.028384474Z [resource.labels.instanceId: convergent-ai] [13:46:36.016] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:46:36.028432415Z [resource.labels.instanceId: convergent-ai] audioTranscript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.028484975Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:46:36.028527730Z [resource.labels.instanceId: convergent-ai] [13:46:36.017] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:46:36.028564933Z [resource.labels.instanceId: convergent-ai] transcript: "It's full stack developer."
DEFAULT 2026-07-08T13:46:36.028600480Z [resource.labels.instanceId: convergent-ai] [13:46:36.017] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:46:36.028643568Z [resource.labels.instanceId: convergent-ai] [13:46:36.018] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:46:36.028686868Z [resource.labels.instanceId: convergent-ai] [13:46:36.018] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:46:36.028722458Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_dc9814f3-f0c"
DEFAULT 2026-07-08T13:46:36.028760398Z [resource.labels.instanceId: convergent-ai] [13:46:36.018] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:46:36.028803151Z [resource.labels.instanceId: convergent-ai] [13:46:36.019] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:46:36.028843586Z [resource.labels.instanceId: convergent-ai] [13:46:36.021] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:46:36.028889649Z [resource.labels.instanceId: convergent-ai] [13:46:36.022] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:46:36.028968572Z [resource.labels.instanceId: convergent-ai] [13:46:36.025] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:46:36.237578351Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:46:36.237] First chunk/token received (TTFT: 212ms)
DEFAULT 2026-07-08T13:46:36.260238295Z [resource.labels.instanceId: convergent-ai] [13:46:36.259] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:46:36.261590471Z [resource.labels.instanceId: convergent-ai] [13:46:36.260] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:46:36.261691879Z [resource.labels.instanceId: convergent-ai] [13:46:36.261] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:46:36.261735458Z [resource.labels.instanceId: convergent-ai] [13:46:36.261] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:46:36.303952488Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:46:36.303] Stream complete (Total: 278ms, chunks: 8)
DEFAULT 2026-07-08T13:46:36.304259129Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:36.304] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:46:36.304364218Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:36.304] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:46:36.304420334Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":33,"sessionAgeMs":692436,"contextItemCount":0,"estimatedContextTokens":2889,"ttftMs":239,"userTurnEndAt":1783518396015}
DEFAULT 2026-07-08T13:46:36.304490947Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:36.304] LLM metrics — TTFT=239ms prompt_tokens=2889 completion_tokens=23
DEFAULT 2026-07-08T13:46:36.305776948Z [resource.labels.instanceId: convergent-ai] [13:46:36.305] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:46:36.306421405Z [resource.labels.instanceId: convergent-ai] [13:46:36.305] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:46:36.306496530Z [resource.labels.instanceId: convergent-ai] [13:46:36.305] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:46:36.465219841Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([employment_position, employment_years]): Cerebras call (attempt 1) took 444.2ms
DEFAULT 2026-07-08T13:46:36.465353494Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:46:36.465394855Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([employment_position, employment_years]): TOTAL 444.3ms (content=ok)
DEFAULT 2026-07-08T13:46:36.465431592Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3B extraction: 444.5ms
DEFAULT 2026-07-08T13:46:36.465473875Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 447.4ms
DEFAULT 2026-07-08T13:46:36.465510088Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 32 extraction finished in 447.4ms.
DEFAULT 2026-07-08T13:46:36.465533590Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 32 background extraction results into state.
DEFAULT 2026-07-08T13:46:36.735700925Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:46:36.735836685Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":33,"sessionAgeMs":692867,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":720,"agentSpeakingAt":1783518396735,"userTurnEndAt":1783518396015}
DEFAULT 2026-07-08T13:46:37.358229024Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:37.358] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:46:37.358342535Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:37.358] ── TURN 33 SUMMARY ── stt_done=? llm_start=? llm_first_token=289ms llm_done=289ms tts_start=? tts_done=1343ms
DEFAULT 2026-07-08T13:46:37.358388700Z [resource.labels.instanceId: convergent-ai] [pipeline][13:46:37.358] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:46:37.359893514Z [resource.labels.instanceId: convergent-ai] [13:46:37.359] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:46:37.360411458Z [resource.labels.instanceId: convergent-ai] [13:46:37.359] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:46:40.294086801Z [resource.labels.instanceId: convergent-ai] [13:46:40.293] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:46:41.309312282Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":33,"sessionAgeMs":697441,"contextItemCount":67,"estimatedContextTokens":1827,"userTurnEndAt":1783518396015}
DEFAULT 2026-07-08T13:46:41.310329596Z [resource.labels.instanceId: convergent-ai] [13:46:41.309] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:46:41.310470110Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_dc9814f3-f0c"
DEFAULT 2026-07-08T13:46:41.310512521Z [resource.labels.instanceId: convergent-ai] message: "I've updated that for you. And how many years have you been working as a full stack developer? "
DEFAULT 2026-07-08T13:46:41.310545245Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:46:41.311518274Z [resource.labels.instanceId: convergent-ai] [13:46:41.311] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:47:01.052181863Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:01.038354+00:00 convergent-ai CRON[49698]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:47:01.052184343Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:01.039898+00:00 convergent-ai CRON[49697]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:47:23.266991405Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:25.269943745Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:27.029484807Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:27.768039934Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:28.439549374Z [resource.labels.instanceId: convergent-ai] [13:47:28.438] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:28.657172145Z [resource.labels.instanceId: convergent-ai] [13:47:28.656] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:29.039860204Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:29.628533047Z [resource.labels.instanceId: convergent-ai] [13:47:29.627] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:29.628694401Z [resource.labels.instanceId: convergent-ai] transcript: "around"
DEFAULT 2026-07-08T13:47:29.648951347Z [resource.labels.instanceId: convergent-ai] [13:47:29.648] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:29.649054215Z [resource.labels.instanceId: convergent-ai] transcript: "around 3 years"
DEFAULT 2026-07-08T13:47:29.669931971Z [resource.labels.instanceId: convergent-ai] [13:47:29.669] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:29.670062579Z [resource.labels.instanceId: convergent-ai] transcript: "around 3 years."
DEFAULT 2026-07-08T13:47:29.672110418Z [resource.labels.instanceId: convergent-ai] [13:47:29.671] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:47:29.672225784Z [resource.labels.instanceId: convergent-ai] user_transcript: "around 3 years."
DEFAULT 2026-07-08T13:47:29.672260265Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:47:29.672307975Z [resource.labels.instanceId: convergent-ai] [13:47:29.671] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:47:29.672344352Z [resource.labels.instanceId: convergent-ai] transcript: "around 3 years."
DEFAULT 2026-07-08T13:47:29.789995324Z [resource.labels.instanceId: convergent-ai] [13:47:29.789] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:29.937833670Z [resource.labels.instanceId: convergent-ai] [13:47:29.937] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:29.939080182Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:29.938] STT final transcript: "around 3 years."
DEFAULT 2026-07-08T13:47:29.939185471Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:29.938] STT complete (-1ms): "around 3 years."
DEFAULT 2026-07-08T13:47:30.253426236Z [resource.labels.instanceId: convergent-ai] [13:47:30.252] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:47:30.300914658Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([employment_years]): Cerebras call (attempt 1) took 355.9ms
DEFAULT 2026-07-08T13:47:30.301042217Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-08T13:47:30.301096679Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractMultipleFields([employment_years]): TOTAL 356.1ms (content=ok)
DEFAULT 2026-07-08T13:47:30.301185317Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3B extraction: 356.3ms
DEFAULT 2026-07-08T13:47:30.301221826Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 359.1ms
DEFAULT 2026-07-08T13:47:30.301267698Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 33 extraction finished in 359.1ms.
DEFAULT 2026-07-08T13:47:30.301287123Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 33 background extraction results into state.
DEFAULT 2026-07-08T13:47:30.301308517Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: employment_details -> checking_savings
DEFAULT 2026-07-08T13:47:30.550953493Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:47:30.551066638Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":34,"sessionAgeMs":746682,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":612,"agentSpeakingAt":1783518450550,"userTurnEndAt":1783518449938}
DEFAULT 2026-07-08T13:47:31.534422138Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:32.087040654Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:32.086] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:47:32.087165294Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:32.086] ── TURN 34 SUMMARY ── stt_done=? llm_start=? llm_first_token=312ms llm_done=312ms tts_start=? tts_done=2148ms
DEFAULT 2026-07-08T13:47:32.087215004Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:32.086] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:47:32.088510691Z [resource.labels.instanceId: convergent-ai] [13:47:32.088] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:47:32.089019701Z [resource.labels.instanceId: convergent-ai] [13:47:32.088] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:47:40.255951592Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:40.974394694Z [resource.labels.instanceId: convergent-ai] [13:47:40.973] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:47:42.046312372Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":34,"sessionAgeMs":758178,"contextItemCount":69,"estimatedContextTokens":1885,"userTurnEndAt":1783518449938}
DEFAULT 2026-07-08T13:47:42.047572545Z [resource.labels.instanceId: convergent-ai] [13:47:42.046] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:47:42.047722190Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_907713ae-465"
DEFAULT 2026-07-08T13:47:42.047760030Z [resource.labels.instanceId: convergent-ai] message: "Thank you for that. Since you're self-employed, the next part of the process is just getting a general sense of your assets—specifically, roughly how much do you currently have in your checking and savings accounts? "
DEFAULT 2026-07-08T13:47:42.047850015Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:47:42.048952502Z [resource.labels.instanceId: convergent-ai] [13:47:42.048] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:47:42.259902767Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:44.761003748Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:47:45.132888974Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:47.135898612Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:49.636843143Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:47:53.052158313Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.905777+00:00 convergent-ai PackageKit: daemon quit
DEFAULT 2026-07-08T13:47:53.052160081Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906415+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052160480Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906569+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052160708Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906626+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052160904Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906675+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052161110Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906716+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052161407Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906770+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052161590Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906813+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052161815Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906856+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052162123Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906900+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052162363Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906940+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052162545Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.906982+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052162747Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907033+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052162933Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907073+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052163176Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907112+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052163360Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907153+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052163550Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907196+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052163738Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907237+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052163954Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907275+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052164133Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907317+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:47:53.052164320Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907359+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052164499Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.907398+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:48:22 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:47:53.052164722Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:47:52.909198+00:00 convergent-ai systemd[1]: packagekit.service: Deactivated successfully.
DEFAULT 2026-07-08T13:47:56.919811100Z [resource.labels.instanceId: convergent-ai] [13:47:56.919] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:57.305536308Z [resource.labels.instanceId: convergent-ai] [13:47:57.305] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:58.442861538Z [resource.labels.instanceId: convergent-ai] [13:47:58.442] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:58.442991947Z [resource.labels.instanceId: convergent-ai] transcript: "around"
DEFAULT 2026-07-08T13:47:59.043519926Z [resource.labels.instanceId: convergent-ai] [13:47:59.043] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:59.043650188Z [resource.labels.instanceId: convergent-ai] transcript: "around "
DEFAULT 2026-07-08T13:47:59.064398584Z [resource.labels.instanceId: convergent-ai] [13:47:59.063] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:59.064524846Z [resource.labels.instanceId: convergent-ai] transcript: "around 720"
DEFAULT 2026-07-08T13:47:59.085437323Z [resource.labels.instanceId: convergent-ai] [13:47:59.085] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:59.085566237Z [resource.labels.instanceId: convergent-ai] transcript: "around 72000 dollars"
DEFAULT 2026-07-08T13:47:59.106272675Z [resource.labels.instanceId: convergent-ai] [13:47:59.105] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:47:59.106396818Z [resource.labels.instanceId: convergent-ai] transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.108295399Z [resource.labels.instanceId: convergent-ai] [13:47:59.107] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:47:59.108394482Z [resource.labels.instanceId: convergent-ai] user_transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.108436430Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:47:59.108480020Z [resource.labels.instanceId: convergent-ai] [13:47:59.107] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:47:59.108524253Z [resource.labels.instanceId: convergent-ai] transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.228104048Z [resource.labels.instanceId: convergent-ai] [13:47:59.227] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:59.229265187Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:59.229] STT final transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.229377461Z [resource.labels.instanceId: convergent-ai] [pipeline][13:47:59.229] STT complete (-1ms): "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.232838571Z [resource.labels.instanceId: convergent-ai] [13:47:59.229] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:47:59.232972692Z [resource.labels.instanceId: convergent-ai] user_transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.233011621Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:47:59.233047943Z [resource.labels.instanceId: convergent-ai] [13:47:59.231] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:47:59.233085035Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518476854.0505
DEFAULT 2026-07-08T13:47:59.233124989Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:47:59.233160144Z [resource.labels.instanceId: convergent-ai] [13:47:59.231] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:47:59.233227994Z [resource.labels.instanceId: convergent-ai] [13:47:59.231] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:47:59.233262489Z [resource.labels.instanceId: convergent-ai] audioTranscript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.233288344Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:47:59.350775782Z [resource.labels.instanceId: convergent-ai] [13:47:59.350] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:47:59.350889092Z [resource.labels.instanceId: convergent-ai] transcript: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.351277019Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "around 72000 dollars."
DEFAULT 2026-07-08T13:47:59.351386756Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 33 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:47:59.351425898Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 33 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:47:59.351613259Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:47:59.351912816Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:47:59.351984796Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3B, pendingField=checking_savings
DEFAULT 2026-07-08T13:47:59.352020847Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:47:59.352056090Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:47:59.352094286Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:47:59.352124729Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:47:59.352166075Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:47:59.354419037Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.2ms (corrected=false)
DEFAULT 2026-07-08T13:47:59.354531403Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "checking_savings" is 1
DEFAULT 2026-07-08T13:47:59.354565650Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("checking_savings_balance"): START (running concurrent with main LLM if race not yet resolved)
DEFAULT 2026-07-08T13:47:59.355445108Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":35,"sessionAgeMs":775487,"contextItemCount":70,"estimatedContextTokens":1890,"userTurnEndAt":1783518479229}
DEFAULT 2026-07-08T13:47:59.356280281Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:47:59.359435803Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:47:59.359] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:47:59.361300021Z [resource.labels.instanceId: convergent-ai] [13:47:59.350] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:47:59.361392680Z [resource.labels.instanceId: convergent-ai] [13:47:59.351] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:49:11.411764900Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions?"
DEFAULT 2026-07-08T13:49:11.413634752Z [resource.labels.instanceId: convergent-ai] [13:49:11.412] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:49:11.413744549Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, can I skip these questions?"
DEFAULT 2026-07-08T13:49:11.413790960Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:49:11.413840366Z [resource.labels.instanceId: convergent-ai] [13:49:11.413] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:49:11.413884696Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions?"
DEFAULT 2026-07-08T13:49:11.721004695Z [resource.labels.instanceId: convergent-ai] [13:49:11.720] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:11.721130793Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions?"
DEFAULT 2026-07-08T13:49:12.508053479Z [resource.labels.instanceId: convergent-ai] [13:49:12.507] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:12.508169950Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like"
DEFAULT 2026-07-08T13:49:12.670810609Z [resource.labels.instanceId: convergent-ai] [13:49:12.670] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:12.670944390Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if"
DEFAULT 2026-07-08T13:49:12.835742247Z [resource.labels.instanceId: convergent-ai] [13:49:12.835] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:12.835879226Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they'"
DEFAULT 2026-07-08T13:49:12.856700275Z [resource.labels.instanceId: convergent-ai] [13:49:12.856] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:12.856826570Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're"
DEFAULT 2026-07-08T13:49:13.332079859Z [resource.labels.instanceId: convergent-ai] [13:49:13.331] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.332194867Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional,"
DEFAULT 2026-07-08T13:49:13.352479823Z [resource.labels.instanceId: convergent-ai] [13:49:13.352] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.352601259Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I"
DEFAULT 2026-07-08T13:49:13.620619851Z [resource.labels.instanceId: convergent-ai] [13:49:13.620] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.620743980Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just"
DEFAULT 2026-07-08T13:49:13.952925599Z [resource.labels.instanceId: convergent-ai] [13:49:13.952] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.953052950Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don"
DEFAULT 2026-07-08T13:49:13.973415492Z [resource.labels.instanceId: convergent-ai] [13:49:13.973] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.973551847Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want"
DEFAULT 2026-07-08T13:49:13.993826502Z [resource.labels.instanceId: convergent-ai] [13:49:13.993] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:13.993931805Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them"
DEFAULT 2026-07-08T13:49:14.014940375Z [resource.labels.instanceId: convergent-ai] [13:49:14.014] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:49:14.015069900Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.016813930Z [resource.labels.instanceId: convergent-ai] [13:49:14.016] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:49:14.016919604Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.016957508Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:49:14.016999424Z [resource.labels.instanceId: convergent-ai] [13:49:14.016] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:49:14.017033642Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.117512850Z [resource.labels.instanceId: convergent-ai] [13:49:14.117] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:49:14.118871605Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:14.118] STT final transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.118987596Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:14.118] STT complete (-1ms): "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.122358719Z [resource.labels.instanceId: convergent-ai] [13:49:14.119] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:49:14.122478974Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.122518940Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:49:14.122560848Z [resource.labels.instanceId: convergent-ai] [13:49:14.120] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:49:14.122604875Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518549914.731
DEFAULT 2026-07-08T13:49:14.122648525Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:49:14.122691303Z [resource.labels.instanceId: convergent-ai] [13:49:14.120] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:49:14.122731474Z [resource.labels.instanceId: convergent-ai] [13:49:14.121] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:49:14.122774859Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.122808128Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:49:14.329194799Z [resource.labels.instanceId: convergent-ai] [13:49:14.328] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:49:14.329328537Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.329674771Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh, can I skip these questions? Like if they're optional, I just don't want to answer them."
DEFAULT 2026-07-08T13:49:14.329772102Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 35 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:49:14.329811042Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 35 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:49:14.330035874Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:49:14.330267715Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:49:14.330339554Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=3B, pendingField=hmda
DEFAULT 2026-07-08T13:49:14.330384055Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:49:14.330415204Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:49:14.330447479Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:49:14.330504478Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.8ms
DEFAULT 2026-07-08T13:49:14.330588569Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.6ms (handled=false)
DEFAULT 2026-07-08T13:49:14.332577166Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.0ms (corrected=false)
DEFAULT 2026-07-08T13:49:14.332678659Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "hmda" is 1
DEFAULT 2026-07-08T13:49:14.332715939Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("hmda"): START (running concurrent with main LLM if race not yet resolved)
DEFAULT 2026-07-08T13:49:14.333594728Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":37,"sessionAgeMs":850465,"contextItemCount":74,"estimatedContextTokens":2077,"userTurnEndAt":1783518554118}
DEFAULT 2026-07-08T13:49:14.334305064Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:49:14.338063933Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:49:14.337] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:49:14.341066209Z [resource.labels.instanceId: convergent-ai] [13:49:14.329] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:49:14.341147545Z [resource.labels.instanceId: convergent-ai] [13:49:14.330] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:49:14.341187239Z [resource.labels.instanceId: convergent-ai] [13:49:14.330] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:49:14.341211201Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_f9f6b5a5-1f6"
DEFAULT 2026-07-08T13:49:14.341251598Z [resource.labels.instanceId: convergent-ai] [13:49:14.330] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:49:14.341296864Z [resource.labels.instanceId: convergent-ai] [13:49:14.331] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:49:14.341334312Z [resource.labels.instanceId: convergent-ai] [13:49:14.332] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:49:14.341373780Z [resource.labels.instanceId: convergent-ai] [13:49:14.334] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:49:14.341414677Z [resource.labels.instanceId: convergent-ai] [13:49:14.337] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:49:14.637196790Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("hmda"): Cerebras call (attempt 1) took 304.4ms
DEFAULT 2026-07-08T13:49:14.637328381Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted "hmda" raw JSON: null
DEFAULT 2026-07-08T13:49:14.637431433Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor extractProfileField("hmda"): TOTAL 304.5ms (content=ok)
DEFAULT 2026-07-08T13:49:14.637486012Z [resource.labels.instanceId: convergent-ai] [perf] context-manager stage3B extraction: 304.6ms
DEFAULT 2026-07-08T13:49:14.637524381Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL: 307.2ms
DEFAULT 2026-07-08T13:49:14.637560128Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 36 extraction finished in 307.3ms.
DEFAULT 2026-07-08T13:49:14.637591795Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 36 background extraction results into state.
DEFAULT 2026-07-08T13:49:14.637623353Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: hmda -> submit_confirmation
DEFAULT 2026-07-08T13:49:14.804251027Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:49:14.804] First chunk/token received (TTFT: 467ms)
DEFAULT 2026-07-08T13:49:14.805151900Z [resource.labels.instanceId: convergent-ai] [13:49:14.804] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:49:14.807433331Z [resource.labels.instanceId: convergent-ai] [13:49:14.805] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:49:14.807534397Z [resource.labels.instanceId: convergent-ai] [13:49:14.806] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:49:14.807576680Z [resource.labels.instanceId: convergent-ai] [13:49:14.806] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:49:14.923389905Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:49:14.923] Stream complete (Total: 586ms, chunks: 23)
DEFAULT 2026-07-08T13:49:14.923737559Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:14.923] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:49:14.923841841Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:14.923] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:49:14.923894654Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":37,"sessionAgeMs":851055,"contextItemCount":0,"estimatedContextTokens":2981,"ttftMs":472,"userTurnEndAt":1783518554118}
DEFAULT 2026-07-08T13:49:14.923936160Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:14.923] LLM metrics — TTFT=472ms prompt_tokens=2981 completion_tokens=84
DEFAULT 2026-07-08T13:49:14.925492805Z [resource.labels.instanceId: convergent-ai] [13:49:14.925] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:49:14.926104013Z [resource.labels.instanceId: convergent-ai] [13:49:14.925] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:49:14.926169886Z [resource.labels.instanceId: convergent-ai] [13:49:14.925] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:49:15.173962483Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:49:15.174080295Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":37,"sessionAgeMs":851305,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1055,"agentSpeakingAt":1783518555173,"userTurnEndAt":1783518554118}
DEFAULT 2026-07-08T13:49:18.527840015Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:18.527] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:49:18.527973896Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:18.527] ── TURN 37 SUMMARY ── stt_done=? llm_start=? llm_first_token=805ms llm_done=805ms tts_start=? tts_done=4409ms
DEFAULT 2026-07-08T13:49:18.528019069Z [resource.labels.instanceId: convergent-ai] [pipeline][13:49:18.527] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:49:18.529444469Z [resource.labels.instanceId: convergent-ai] [13:49:18.529] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:49:18.529979381Z [resource.labels.instanceId: convergent-ai] [13:49:18.529] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:49:34.294177748Z [resource.labels.instanceId: convergent-ai] [13:49:34.293] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:50:00.813788503Z [resource.labels.instanceId: convergent-ai] [13:50:00.813] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:50:01.252709630Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.059265+00:00 convergent-ai CRON[49706]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:50:01.252712176Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064049+00:00 convergent-ai systemd[1]: Starting sysstat-collect.service - system activity accounting tool...
DEFAULT 2026-07-08T13:50:01.252712506Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064608+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252712823Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064746+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252713223Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064803+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252713460Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064845+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252713712Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064889+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252713985Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064929+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252714332Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.064970+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252714570Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065004+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252714836Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065050+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252715073Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065094+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252715415Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065134+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252715715Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065182+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252716003Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065224+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252716296Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065267+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252716763Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065310+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252717147Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065346+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252717506Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065387+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252717887Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065427+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252718269Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065486+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' resumed (module 'builtin:omfile') [v8.2312.0 try https://www.rsyslog.com/e/2359 ]
DEFAULT 2026-07-08T13:50:01.252718569Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065561+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), retry 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252718888Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.065600+00:00 convergent-ai rsyslogd: action 'action-8-builtin:omfile' suspended (module 'builtin:omfile'), next retry is Wed Jul 8 13:50:31 2026, retry nbr 0. There should be messages before this one giving the reason for suspension. [v8.2312.0 try https://www.rsyslog.com/e/2007 ]
DEFAULT 2026-07-08T13:50:01.252719197Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.066444+00:00 convergent-ai CRON[49705]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:50:01.252719562Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.080147+00:00 convergent-ai systemd[1]: sysstat-collect.service: Deactivated successfully.
DEFAULT 2026-07-08T13:50:01.252719826Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:50:01.080367+00:00 convergent-ai systemd[1]: Finished sysstat-collect.service - system activity accounting tool.
DEFAULT 2026-07-08T13:50:01.854685712Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":38,"sessionAgeMs":897986,"contextItemCount":77,"estimatedContextTokens":2224,"userTurnEndAt":1783518592816}
DEFAULT 2026-07-08T13:50:01.855890004Z [resource.labels.instanceId: convergent-ai] [13:50:01.855] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:50:01.855985382Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_f0e8136a-945"
DEFAULT 2026-07-08T13:50:01.856033656Z [resource.labels.instanceId: convergent-ai] message: "Perfect. I am submitting your application now. Please hang tight for just a moment while the system reviews everything, and I'll let you know as soon as I have the results! "
DEFAULT 2026-07-08T13:50:01.856072232Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:50:01.859123968Z [resource.labels.instanceId: convergent-ai] [13:50:01.856] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:50:22.790563292Z [resource.labels.instanceId: convergent-ai] [13:50:22.790] [33mWARN[39m (102): [36mCartesia STT WebSocket closed: 1006 [39m
DEFAULT 2026-07-08T13:50:22.831086211Z [resource.labels.instanceId: convergent-ai] [13:50:22.826] [31mERROR[39m (102): [36mCartesia STT stream error[39m
DEFAULT 2026-07-08T13:50:22.831222379Z [resource.labels.instanceId: convergent-ai] [13:50:22.826] [33mWARN[39m (102): [36mfailed to recognize speech, retrying in 0.1ms[39m
DEFAULT 2026-07-08T13:50:22.831260779Z [resource.labels.instanceId: convergent-ai] stt: "cartesia.STT"
DEFAULT 2026-07-08T13:50:22.831296416Z [resource.labels.instanceId: convergent-ai] attempt: 1
DEFAULT 2026-07-08T13:50:22.831324577Z [resource.labels.instanceId: convergent-ai] error: {
DEFAULT 2026-07-08T13:50:22.831355129Z [resource.labels.instanceId: convergent-ai] "type": "APIConnectionError",
DEFAULT 2026-07-08T13:50:22.831382880Z [resource.labels.instanceId: convergent-ai] "message": "Cartesia STT connection closed unexpectedly (code=1006)",
DEFAULT 2026-07-08T13:50:22.831414451Z [resource.labels.instanceId: convergent-ai] "stack":
DEFAULT 2026-07-08T13:50:22.831447003Z [resource.labels.instanceId: convergent-ai] APIConnectionError: Cartesia STT connection closed unexpectedly (code=1006)
DEFAULT 2026-07-08T13:50:22.831493768Z [resource.labels.instanceId: convergent-ai] at WebSocket.<anonymous> (/app/node_modules/@livekit/agents-plugin-cartesia/src/stt.ts:486:11)
DEFAULT 2026-07-08T13:50:22.831521571Z [resource.labels.instanceId: convergent-ai] at WebSocket.emit (node:events:524:28)
DEFAULT 2026-07-08T13:50:22.831549792Z [resource.labels.instanceId: convergent-ai] at WebSocket.emitClose (/app/node_modules/ws/lib/websocket.js:273:10)
DEFAULT 2026-07-08T13:50:22.831574957Z [resource.labels.instanceId: convergent-ai] at TLSSocket.socketOnClose (/app/node_modules/ws/lib/websocket.js:1346:15)
DEFAULT 2026-07-08T13:50:22.831602792Z [resource.labels.instanceId: convergent-ai] at TLSSocket.emit (node:events:536:35)
DEFAULT 2026-07-08T13:50:22.831628811Z [resource.labels.instanceId: convergent-ai] at node:net:343:12
DEFAULT 2026-07-08T13:50:22.831655172Z [resource.labels.instanceId: convergent-ai] at TCP.done (node:_tls_wrap:669:7)
DEFAULT 2026-07-08T13:50:22.831700270Z [resource.labels.instanceId: convergent-ai] at TCP.callbackTrampoline (node:internal/async_hooks:130:17)
DEFAULT 2026-07-08T13:50:22.831729869Z [resource.labels.instanceId: convergent-ai] "body": null,
DEFAULT 2026-07-08T13:50:22.831759781Z [resource.labels.instanceId: convergent-ai] "retryable": true,
DEFAULT 2026-07-08T13:50:22.831791123Z [resource.labels.instanceId: convergent-ai] "name": "APIConnectionError"
DEFAULT 2026-07-08T13:50:22.831818298Z [resource.labels.instanceId: convergent-ai] }
DEFAULT 2026-07-08T13:50:22.837291153Z [resource.labels.instanceId: convergent-ai] [13:50:22.835] [34mDEBUG[39m (102): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-08T13:50:25.099804417Z [resource.labels.instanceId: convergent-ai] [13:50:25.099] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:50:25.342442421Z [resource.labels.instanceId: convergent-ai] [13:50:25.341] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:50:26.115234685Z [resource.labels.instanceId: convergent-ai] [13:50:26.114] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:26.115364555Z [resource.labels.instanceId: convergent-ai] transcript: "Sure"
DEFAULT 2026-07-08T13:50:26.905430394Z [resource.labels.instanceId: convergent-ai] [13:50:26.904] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:26.905570546Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so"
DEFAULT 2026-07-08T13:50:27.072842548Z [resource.labels.instanceId: convergent-ai] [13:50:27.072] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:27.072958369Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should"
DEFAULT 2026-07-08T13:50:27.393946237Z [resource.labels.instanceId: convergent-ai] [13:50:27.393] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:27.394080167Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I"
DEFAULT 2026-07-08T13:50:27.720337960Z [resource.labels.instanceId: convergent-ai] [13:50:27.719] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:27.720484843Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I should"
DEFAULT 2026-07-08T13:50:27.889365514Z [resource.labels.instanceId: convergent-ai] [13:50:27.888] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:27.889492401Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I should I"
DEFAULT 2026-07-08T13:50:28.176528683Z [resource.labels.instanceId: convergent-ai] [13:50:28.175] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:28.176646435Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I should I just"
DEFAULT 2026-07-08T13:50:28.197301222Z [resource.labels.instanceId: convergent-ai] [13:50:28.196] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:50:28.197411663Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.209407042Z [resource.labels.instanceId: convergent-ai] [13:50:28.208] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:50:28.217413388Z [resource.labels.instanceId: convergent-ai] [13:50:28.216] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:50:28.217549232Z [resource.labels.instanceId: convergent-ai] user_transcript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.217595006Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:50:28.218348376Z [resource.labels.instanceId: convergent-ai] [13:50:28.217] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:50:28.218497332Z [resource.labels.instanceId: convergent-ai] transcript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.359275734Z [resource.labels.instanceId: convergent-ai] [13:50:28.358] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:50:28.360277620Z [resource.labels.instanceId: convergent-ai] [pipeline][13:50:28.360] STT final transcript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.360410313Z [resource.labels.instanceId: convergent-ai] [pipeline][13:50:28.360] STT complete (-1ms): "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.362940009Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.363054895Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 37 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:50:28.363092793Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 37 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:50:28.363212813Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:50:28.363651357Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:50:28.363802510Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=4, pendingField=checklist_acknowledgement
DEFAULT 2026-07-08T13:50:28.363849093Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.4ms
DEFAULT 2026-07-08T13:50:28.363888766Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:50:28.363919638Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:50:28.363951673Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 1.0ms
DEFAULT 2026-07-08T13:50:28.364007073Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.8ms (handled=false)
DEFAULT 2026-07-08T13:50:28.366186587Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.1ms (corrected=false)
DEFAULT 2026-07-08T13:50:28.366278964Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "checklist_acknowledgement" is 1
DEFAULT 2026-07-08T13:50:28.366360863Z [resource.labels.instanceId: convergent-ai] [perf] llm-extractor classifyConfirmation("checklist_discussed"): START
DEFAULT 2026-07-08T13:50:28.367407820Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":39,"sessionAgeMs":924499,"contextItemCount":78,"estimatedContextTokens":2234,"userTurnEndAt":1783518628360}
DEFAULT 2026-07-08T13:50:28.368540133Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:50:28.371353296Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:50:28.371] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:50:28.373304801Z [resource.labels.instanceId: convergent-ai] [13:50:28.360] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:50:28.373395212Z [resource.labels.instanceId: convergent-ai] user_transcript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.373430052Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:50:28.373526454Z [resource.labels.instanceId: convergent-ai] [13:50:28.361] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:50:28.373562648Z [resource.labels.instanceId: convergent-ai] [13:50:28.361] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:50:28.373603717Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Sure, so should I should I just wait now?"
DEFAULT 2026-07-08T13:50:28.373657988Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:51:25.085881699Z [resource.labels.instanceId: convergent-ai] [reconcile] Transitioning currentPendingField: checklist_acknowledgement -> null
DEFAULT 2026-07-08T13:51:25.331426949Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:51:25.331] Stream complete (Total: 473ms, chunks: 22)
DEFAULT 2026-07-08T13:51:25.331746318Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:25.331] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:51:25.331837078Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:25.331] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:51:25.331879574Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":40,"sessionAgeMs":981463,"contextItemCount":0,"estimatedContextTokens":3127,"ttftMs":197,"userTurnEndAt":1783518684520}
DEFAULT 2026-07-08T13:51:25.331919Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:25.331] LLM metrics — TTFT=197ms prompt_tokens=3127 completion_tokens=67
DEFAULT 2026-07-08T13:51:25.333652023Z [resource.labels.instanceId: convergent-ai] [13:51:25.333] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:51:25.335047220Z [resource.labels.instanceId: convergent-ai] [13:51:25.333] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:51:25.335137984Z [resource.labels.instanceId: convergent-ai] [13:51:25.333] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:51:25.494583340Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:51:25.494716647Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":40,"sessionAgeMs":981626,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":974,"agentSpeakingAt":1783518685494,"userTurnEndAt":1783518684520}
DEFAULT 2026-07-08T13:51:27.927513961Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:27.927] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:51:27.927677454Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:27.927] ── TURN 40 SUMMARY ── stt_done=? llm_start=? llm_first_token=811ms llm_done=811ms tts_start=? tts_done=3407ms
DEFAULT 2026-07-08T13:51:27.927725304Z [resource.labels.instanceId: convergent-ai] [pipeline][13:51:27.927] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:51:27.929160080Z [resource.labels.instanceId: convergent-ai] [13:51:27.928] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:51:27.929789581Z [resource.labels.instanceId: convergent-ai] [13:51:27.929] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:51:39.273827336Z [resource.labels.instanceId: convergent-ai] [13:51:39.273] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:51:40.357721729Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":40,"sessionAgeMs":996489,"contextItemCount":81,"estimatedContextTokens":2469,"userTurnEndAt":1783518684520}
DEFAULT 2026-07-08T13:51:40.358956110Z [resource.labels.instanceId: convergent-ai] [13:51:40.358] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:51:40.359066001Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_1660596f-666"
DEFAULT 2026-07-08T13:51:40.359120201Z [resource.labels.instanceId: convergent-ai] message: "That's great to hear! Having those ready will help keep things moving quickly. The next step is to get these over to the team so they can finalize everything. Would you prefer to upload them through our secure portal, or should I have your licensed mortgage loan officer reach out to coordinate the best way to send them? "
DEFAULT 2026-07-08T13:51:40.359179398Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:51:40.361585717Z [resource.labels.instanceId: convergent-ai] [13:51:40.359] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:52:01.252946868Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:52:01.080180+00:00 convergent-ai CRON[49714]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:52:01.252949156Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:52:01.080252+00:00 convergent-ai CRON[49713]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:52:09.889884628Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:52:11.896930923Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:52:14.395019437Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-08T13:52:21.359392574Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:52:22.989052834Z [resource.labels.instanceId: convergent-ai] [13:52:22.988] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:23.234272645Z [resource.labels.instanceId: convergent-ai] [13:52:23.233] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:23.359867928Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:52:24.188190098Z [resource.labels.instanceId: convergent-ai] [13:52:24.187] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:24.188338196Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-08T13:52:25.300611965Z [resource.labels.instanceId: convergent-ai] [13:52:25.300] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:25.300737653Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule"
DEFAULT 2026-07-08T13:52:25.794100457Z [resource.labels.instanceId: convergent-ai] [13:52:25.793] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:25.794227688Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something"
DEFAULT 2026-07-08T13:52:25.860850636Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-08T13:52:25.969984941Z [resource.labels.instanceId: convergent-ai] [13:52:25.969] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:25.970099351Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the"
DEFAULT 2026-07-08T13:52:26.282052422Z [resource.labels.instanceId: convergent-ai] [13:52:26.281] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:26.282167979Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan"
DEFAULT 2026-07-08T13:52:26.731033011Z [resource.labels.instanceId: convergent-ai] [13:52:26.730] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:26.731161365Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer"
DEFAULT 2026-07-08T13:52:26.905853365Z [resource.labels.instanceId: convergent-ai] [13:52:26.905] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:26.905971974Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so"
DEFAULT 2026-07-08T13:52:27.079530117Z [resource.labels.instanceId: convergent-ai] [13:52:27.079] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:27.079650393Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you"
DEFAULT 2026-07-08T13:52:27.392191470Z [resource.labels.instanceId: convergent-ai] [13:52:27.391] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:27.392312657Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know,"
DEFAULT 2026-07-08T13:52:27.411220321Z [resource.labels.instanceId: convergent-ai] [13:52:27.410] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:27.411333581Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I"
DEFAULT 2026-07-08T13:52:27.730750921Z [resource.labels.instanceId: convergent-ai] [13:52:27.730] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:27.730885825Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can"
DEFAULT 2026-07-08T13:52:27.860309997Z [resource.labels.instanceId: convergent-ai] [13:52:27.859] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:27.860424825Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have"
DEFAULT 2026-07-08T13:52:28.019719851Z [resource.labels.instanceId: convergent-ai] [13:52:28.019] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:28.019834327Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a"
DEFAULT 2026-07-08T13:52:28.348967334Z [resource.labels.instanceId: convergent-ai] [13:52:28.348] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:28.349080260Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat"
DEFAULT 2026-07-08T13:52:28.523080332Z [resource.labels.instanceId: convergent-ai] [13:52:28.522] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:28.523205036Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with"
DEFAULT 2026-07-08T13:52:28.679686870Z [resource.labels.instanceId: convergent-ai] [13:52:28.679] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:28.679806645Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him"
DEFAULT 2026-07-08T13:52:28.973358935Z [resource.labels.instanceId: convergent-ai] [13:52:28.972] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:28.973517075Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and"
DEFAULT 2026-07-08T13:52:29.329673758Z [resource.labels.instanceId: convergent-ai] [13:52:29.329] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:29.465946013Z [resource.labels.instanceId: convergent-ai] [13:52:29.465] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:29.466073331Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get"
DEFAULT 2026-07-08T13:52:29.801296341Z [resource.labels.instanceId: convergent-ai] [13:52:29.800] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:29.801410147Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to"
DEFAULT 2026-07-08T13:52:29.809178586Z [resource.labels.instanceId: convergent-ai] [13:52:29.808] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:30.749110618Z [resource.labels.instanceId: convergent-ai] [13:52:30.748] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:30.749250225Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh"
DEFAULT 2026-07-08T13:52:31.248942241Z [resource.labels.instanceId: convergent-ai] [13:52:31.248] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:31.249054977Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete"
DEFAULT 2026-07-08T13:52:31.439683579Z [resource.labels.instanceId: convergent-ai] [13:52:31.439] [34mDEBUG[39m (102): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:31.535946670Z [resource.labels.instanceId: convergent-ai] [13:52:31.535] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:31.536090120Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these"
DEFAULT 2026-07-08T13:52:32.027221344Z [resource.labels.instanceId: convergent-ai] [13:52:32.026] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:32.027330133Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff"
DEFAULT 2026-07-08T13:52:32.047041802Z [resource.labels.instanceId: convergent-ai] [13:52:32.046] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:52:32.047162960Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:32.049408482Z [resource.labels.instanceId: convergent-ai] [13:52:32.048] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:52:32.049526860Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:32.049563829Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:52:32.049593938Z [resource.labels.instanceId: convergent-ai] [13:52:32.048] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:52:32.049627055Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh,..."
DEFAULT 2026-07-08T13:52:32.191976301Z [resource.labels.instanceId: convergent-ai] [13:52:32.191] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:52:32.192956103Z [resource.labels.instanceId: convergent-ai] [pipeline][13:52:32.192] STT final transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:32.193081632Z [resource.labels.instanceId: convergent-ai] [pipeline][13:52:32.192] STT complete (-1ms): "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:32.195354455Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:32.195459251Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 39 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:52:32.195516358Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 39 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:52:32.195648581Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:52:32.196050454Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:52:32.196124208Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=5, pendingField=null
DEFAULT 2026-07-08T13:52:32.196156736Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.4ms
DEFAULT 2026-07-08T13:52:32.196184127Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:52:32.196211685Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:52:32.196259625Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:52:32.196295302Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:52:32.198605549Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.2ms (corrected=false)
DEFAULT 2026-07-08T13:52:32.198828898Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL (no pending field): 3.0ms
DEFAULT 2026-07-08T13:52:32.198879498Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 40 extraction finished in 3.0ms.
DEFAULT 2026-07-08T13:52:32.198908121Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 40 background extraction results into state.
DEFAULT 2026-07-08T13:52:32.199366895Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":41,"sessionAgeMs":1048331,"contextItemCount":82,"estimatedContextTokens":2500,"userTurnEndAt":1783518752192}
DEFAULT 2026-07-08T13:52:32.200205543Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:52:32.201760323Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:52:32.201] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:52:32.204931836Z [resource.labels.instanceId: convergent-ai] [13:52:32.193] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:52:32.205015322Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, schedule something with the loan officer so, you know, I can have a chat with him and get to uh, complete these stuff."
DEFAULT 2026-07-08T13:52:50.431874542Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":2587,"itemCount":83,"action":"compact_start","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:52:50.436146850Z [resource.labels.instanceId: convergent-ai] [13:52:50.432] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:52:51.018716125Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"context_compaction","itemsBefore":83,"itemsAfter":11,"turnNumber":41,"sessionAgeMs":1067150}
DEFAULT 2026-07-08T13:52:51.018837743Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":41,"sessionAgeMs":1067150,"contextItemCount":11,"estimatedContextTokens":643,"userTurnEndAt":1783518752192}
DEFAULT 2026-07-08T13:52:51.018893840Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":643,"itemCount":11,"action":"compact_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-08T13:52:51.018933178Z [resource.labels.instanceId: convergent-ai] [context]: Compacted 83Ã¢â€ â€™11 items, ~2587Ã¢â€ â€™643 text tokens (last API input: 0)
DEFAULT 2026-07-08T13:53:01.252632715Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:53:01.084501+00:00 convergent-ai CRON[50127]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:53:01.252634387Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:53:01.086308+00:00 convergent-ai CRON[50126]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:53:14.409940418Z [resource.labels.instanceId: convergent-ai] [13:53:14.409] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:53:14.906753591Z [resource.labels.instanceId: convergent-ai] [13:53:14.906] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:53:15.397323619Z [resource.labels.instanceId: convergent-ai] [13:53:15.396] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:15.397452747Z [resource.labels.instanceId: convergent-ai] transcript: "I'"
DEFAULT 2026-07-08T13:53:15.419140553Z [resource.labels.instanceId: convergent-ai] [13:53:15.418] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:15.419261273Z [resource.labels.instanceId: convergent-ai] transcript: "I'll"
DEFAULT 2026-07-08T13:53:15.704574323Z [resource.labels.instanceId: convergent-ai] [13:53:15.704] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:15.704704121Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just"
DEFAULT 2026-07-08T13:53:15.868075947Z [resource.labels.instanceId: convergent-ai] [13:53:15.867] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:15.868201458Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do"
DEFAULT 2026-07-08T13:53:16.354771022Z [resource.labels.instanceId: convergent-ai] [13:53:16.354] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:16.354897063Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever"
DEFAULT 2026-07-08T13:53:16.518228147Z [resource.labels.instanceId: convergent-ai] [13:53:16.517] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:16.518368363Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the"
DEFAULT 2026-07-08T13:53:16.682482372Z [resource.labels.instanceId: convergent-ai] [13:53:16.681] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:16.682636826Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the loan"
DEFAULT 2026-07-08T13:53:16.870630927Z [resource.labels.instanceId: convergent-ai] [13:53:16.870] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:16.870761126Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the loan officer"
DEFAULT 2026-07-08T13:53:16.885529557Z [resource.labels.instanceId: convergent-ai] [13:53:16.885] [34mDEBUG[39m (102): [36minterim transcript[39m
DEFAULT 2026-07-08T13:53:16.885640787Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:16.906306263Z [resource.labels.instanceId: convergent-ai] [13:53:16.905] [34mDEBUG[39m (102): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-08T13:53:16.906425959Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:16.906481765Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:53:16.907179355Z [resource.labels.instanceId: convergent-ai] [13:53:16.906] [34mDEBUG[39m (102): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-08T13:53:16.907273135Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.148894924Z [resource.labels.instanceId: convergent-ai] [13:53:17.148] [34mDEBUG[39m (102): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:53:17.150131633Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:17.149] STT final transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.150392616Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:17.150] STT complete (-1ms): "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.154593946Z [resource.labels.instanceId: convergent-ai] [13:53:17.150] [34mDEBUG[39m (102): [36mreceived user transcript[39m
DEFAULT 2026-07-08T13:53:17.154708657Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.154753083Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-08T13:53:17.154821200Z [resource.labels.instanceId: convergent-ai] [13:53:17.152] [33mWARN[39m (102): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-08T13:53:17.154891530Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783518794344.5276
DEFAULT 2026-07-08T13:53:17.154944521Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-08T13:53:17.154989388Z [resource.labels.instanceId: convergent-ai] [13:53:17.152] [34mDEBUG[39m (102): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-08T13:53:17.155034060Z [resource.labels.instanceId: convergent-ai] [13:53:17.152] [34mDEBUG[39m (102): [36mrunning EOU detection[39m
DEFAULT 2026-07-08T13:53:17.155067237Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.155102485Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-08T13:53:17.228262363Z [resource.labels.instanceId: convergent-ai] [13:53:17.227] [34mDEBUG[39m (102): [36mend of user turn[39m
DEFAULT 2026-07-08T13:53:17.228391304Z [resource.labels.instanceId: convergent-ai] transcript: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.228861850Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I'll just do whenever the loan officer is ready."
DEFAULT 2026-07-08T13:53:17.228955462Z [resource.labels.instanceId: convergent-ai] [checkpoint] Gating on previous turn 40 extraction. Pending count: 0. Max wait: 300ms
DEFAULT 2026-07-08T13:53:17.229011404Z [resource.labels.instanceId: convergent-ai] [checkpoint] Previous turn 40 extraction resolved normally. Waited: 0.0ms
DEFAULT 2026-07-08T13:53:17.229217052Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Current turn background extraction triggered asynchronously.
DEFAULT 2026-07-08T13:53:17.229501618Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-08T13:53:17.229559985Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=5, pendingField=null
DEFAULT 2026-07-08T13:53:17.229597455Z [resource.labels.instanceId: convergent-ai] [perf] updateInstructions (getActiveInstructions + chatCtx write): 0.3ms
DEFAULT 2026-07-08T13:53:17.229655052Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-08T13:53:17.229698877Z [resource.labels.instanceId: convergent-ai] [perf] chatCtx local copy update: 0.1ms
DEFAULT 2026-07-08T13:53:17.229729329Z [resource.labels.instanceId: convergent-ai] [perf] EOU->instructions-update gap: 0.9ms
DEFAULT 2026-07-08T13:53:17.229823855Z [resource.labels.instanceId: convergent-ai] [perf] context-manager handleGlobalConfirmation: 0.7ms (handled=false)
DEFAULT 2026-07-08T13:53:17.232514914Z [resource.labels.instanceId: convergent-ai] [perf] context-manager checkForGlobalCorrections: 2.6ms (corrected=false)
DEFAULT 2026-07-08T13:53:17.232613345Z [resource.labels.instanceId: convergent-ai] [perf] context-manager onUserTurn TOTAL (no pending field): 3.3ms
DEFAULT 2026-07-08T13:53:17.232657988Z [resource.labels.instanceId: convergent-ai] [reconcile] Turn 41 extraction finished in 3.4ms.
DEFAULT 2026-07-08T13:53:17.232708977Z [resource.labels.instanceId: convergent-ai] [reconcile] Merging Turn 41 background extraction results into state.
DEFAULT 2026-07-08T13:53:17.233251232Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":42,"sessionAgeMs":1093365,"contextItemCount":84,"estimatedContextTokens":2599,"userTurnEndAt":1783518797150}
DEFAULT 2026-07-08T13:53:17.233998983Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-08T13:53:17.234999420Z [resource.labels.instanceId: convergent-ai] [13:53:17.228] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-08T13:53:17.235082492Z [resource.labels.instanceId: convergent-ai] [13:53:17.229] [34mDEBUG[39m (102): [36mEOU detection task completed[39m
DEFAULT 2026-07-08T13:53:17.235127061Z [resource.labels.instanceId: convergent-ai] [13:53:17.229] [32mINFO[39m (102): [36mCreating speech handle[39m
DEFAULT 2026-07-08T13:53:17.235191474Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_94382491-b8b"
DEFAULT 2026-07-08T13:53:17.235230585Z [resource.labels.instanceId: convergent-ai] [13:53:17.230] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-08T13:53:17.235273837Z [resource.labels.instanceId: convergent-ai] [13:53:17.230] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-08T13:53:17.235315094Z [resource.labels.instanceId: convergent-ai] [13:53:17.232] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-08T13:53:17.235355141Z [resource.labels.instanceId: convergent-ai] [13:53:17.233] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-08T13:53:17.235390437Z [resource.labels.instanceId: convergent-ai] [13:53:17.234] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-08T13:53:17.238445940Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:53:17.238] Sending request to Cerebras: model=gemma-4-31b
DEFAULT 2026-07-08T13:53:17.416087411Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:53:17.415] First chunk/token received (TTFT: 177ms)
DEFAULT 2026-07-08T13:53:17.432853214Z [resource.labels.instanceId: convergent-ai] [13:53:17.432] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-08T13:53:17.436312575Z [resource.labels.instanceId: convergent-ai] [13:53:17.433] [34mDEBUG[39m (102): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-08T13:53:17.436420785Z [resource.labels.instanceId: convergent-ai] [13:53:17.434] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-08T13:53:17.436457194Z [resource.labels.instanceId: convergent-ai] [13:53:17.434] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-08T13:53:17.512513518Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][13:53:17.512] Stream complete (Total: 274ms, chunks: 19)
DEFAULT 2026-07-08T13:53:17.512851327Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:17.512] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-08T13:53:17.512916211Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:17.512] LLM stream complete total=-1ms
DEFAULT 2026-07-08T13:53:17.512972191Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":42,"sessionAgeMs":1093644,"contextItemCount":0,"estimatedContextTokens":2914,"ttftMs":200,"userTurnEndAt":1783518797150}
DEFAULT 2026-07-08T13:53:17.513003288Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:17.512] LLM metrics — TTFT=200ms prompt_tokens=2914 completion_tokens=74
DEFAULT 2026-07-08T13:53:17.514411591Z [resource.labels.instanceId: convergent-ai] [13:53:17.514] [34mDEBUG[39m (102): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-08T13:53:17.515118999Z [resource.labels.instanceId: convergent-ai] [13:53:17.514] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-08T13:53:17.515182907Z [resource.labels.instanceId: convergent-ai] [13:53:17.514] [34mDEBUG[39m (102): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-08T13:53:17.786497866Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-08T13:53:17.786600049Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":42,"sessionAgeMs":1093918,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":636,"agentSpeakingAt":1783518797786,"userTurnEndAt":1783518797150}
DEFAULT 2026-07-08T13:53:20.098540600Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:20.098] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-08T13:53:20.098675491Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:20.098] ── TURN 42 SUMMARY ── stt_done=? llm_start=? llm_first_token=362ms llm_done=362ms tts_start=? tts_done=2948ms
DEFAULT 2026-07-08T13:53:20.098719895Z [resource.labels.instanceId: convergent-ai] [pipeline][13:53:20.098] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-08T13:53:20.100150903Z [resource.labels.instanceId: convergent-ai] [13:53:20.099] [34mDEBUG[39m (102): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-08T13:53:20.100676283Z [resource.labels.instanceId: convergent-ai] [13:53:20.100] [34mDEBUG[39m (102): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-08T13:53:29.964240853Z [resource.labels.instanceId: convergent-ai] [13:53:29.963] [34mDEBUG[39m (102): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-08T13:53:31.047420638Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":42,"sessionAgeMs":1107179,"contextItemCount":85,"estimatedContextTokens":2675,"userTurnEndAt":1783518797150}
DEFAULT 2026-07-08T13:53:31.049066942Z [resource.labels.instanceId: convergent-ai] [13:53:31.048] [32mINFO[39m (102): [36mplayout completed without interruption[39m
DEFAULT 2026-07-08T13:53:31.049182868Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_94382491-b8b"
DEFAULT 2026-07-08T13:53:31.049222840Z [resource.labels.instanceId: convergent-ai] message: "I've got you covered. I'll notify the team that you're ready and would like them to reach out as soon as they are available. They will have all the information we've discussed today, so you won't have to start from scratch. Is there anything else I can help you with while we wait for them to connect? "
DEFAULT 2026-07-08T13:53:31.049292288Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-08T13:53:31.049842100Z [resource.labels.instanceId: convergent-ai] [13:53:31.049] [34mDEBUG[39m (102): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-08T13:54:01.252392661Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:54:01.091640+00:00 convergent-ai CRON[50129]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-08T13:54:01.252394174Z [resource.labels.instanceId: convergent-ai] 2026-07-08T13:54:01.093788+00:00 convergent-ai CRON[50128]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-08T13:54:14.069724138Z [resource.labels.instanceId: convergent-ai] [13:54:14.069] [34mDEBUG[39m (102): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-08T13:54:14.275159483Z [resource.labels.instanceId: convergent-ai] [13:54:14.274] [34mDEBUG[39m (102): [36mCartesia STT START_OF_SPEECH[39m
