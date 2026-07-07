DEFAULT 2026-07-07T12:32:56.058336584Z [resource.labels.instanceId: convergent-ai] [agent]: Connected to room: room-57n7olnpn
DEFAULT 2026-07-07T12:32:56.084171213Z [resource.labels.instanceId: convergent-ai] [agent]: Ready — model=cascade-livekit-inference (Cerebras GPT-OSS 120B + Cartesia), prompt=mvp-1, compact@6 turns / 6000 tokens
DEFAULT 2026-07-07T12:32:56.319856504Z [resource.labels.instanceId: convergent-ai] [latency-check][12:32:56.319] Cerebras API connection roundtrip test completed in 261ms (HTTP Status: 200)
DEFAULT 2026-07-07T12:32:57.425989175Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:32:57.427274986Z [resource.labels.instanceId: convergent-ai] [12:32:57.426] [34mDEBUG[39m (103): [36mConfiguring session recording (cloud tracer)[39m
DEFAULT 2026-07-07T12:32:57.427401541Z [resource.labels.instanceId: convergent-ai] jobId: "AJ_bRRe67xTXRAf"
DEFAULT 2026-07-07T12:32:57.427435204Z [resource.labels.instanceId: convergent-ai] roomName: "room-57n7olnpn"
DEFAULT 2026-07-07T12:32:57.447713122Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":0,"sessionAgeMs":1667,"contextItemCount":1,"estimatedContextTokens":0}
DEFAULT 2026-07-07T12:32:57.494320116Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: initializing → listening
DEFAULT 2026-07-07T12:32:57.497398668Z [resource.labels.instanceId: convergent-ai] [agent]: Session started on SYSTEM_CHANNEL_START.
DEFAULT 2026-07-07T12:32:57.504521956Z [resource.labels.instanceId: convergent-ai] [agent]: Sent SYSTEM_AGENT_READY signal.
DEFAULT 2026-07-07T12:32:57.507241926Z [resource.labels.instanceId: convergent-ai] [agent]: Greeting fired.
DEFAULT 2026-07-07T12:32:57.542488073Z [resource.labels.instanceId: convergent-ai] [12:32:57.436] [33mWARN[39m (103): [36mtext stream handler for topic "lk.chat" already set, ignoring[39m
DEFAULT 2026-07-07T12:32:57.542609384Z [resource.labels.instanceId: convergent-ai] [12:32:57.441] [34mDEBUG[39m (103): [36mconnection state changed[39m
DEFAULT 2026-07-07T12:32:57.542645773Z [resource.labels.instanceId: convergent-ai] state: 1
DEFAULT 2026-07-07T12:32:57.542681926Z [resource.labels.instanceId: convergent-ai] [12:32:57.443] [33mWARN[39m (103): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-07T12:32:57.542719532Z [resource.labels.instanceId: convergent-ai] [12:32:57.444] [33mWARN[39m (103): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-07T12:32:57.542752929Z [resource.labels.instanceId: convergent-ai] [12:32:57.445] [34mDEBUG[39m (103): [36mTask.runTask: task recorder_io_encode_task started[39m
DEFAULT 2026-07-07T12:32:57.542785892Z [resource.labels.instanceId: convergent-ai] [12:32:57.452] [34mDEBUG[39m (103): [36mAgent handoff inserted into chat context[39m
DEFAULT 2026-07-07T12:32:57.542819436Z [resource.labels.instanceId: convergent-ai] newAgentId: "ailana_voice_agent"
DEFAULT 2026-07-07T12:32:57.542876885Z [resource.labels.instanceId: convergent-ai] [12:32:57.465] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity_onEnter started[39m
DEFAULT 2026-07-07T12:32:57.542902483Z [resource.labels.instanceId: convergent-ai] [12:32:57.476] [34mDEBUG[39m (103): [36msetting participant[39m
DEFAULT 2026-07-07T12:32:57.542927403Z [resource.labels.instanceId: convergent-ai] participantIdentity: "guest_2369"
DEFAULT 2026-07-07T12:32:57.542948979Z [resource.labels.instanceId: convergent-ai] [12:32:57.486] [34mDEBUG[39m (103): [36msetting participant audio input[39m
DEFAULT 2026-07-07T12:32:57.542985769Z [resource.labels.instanceId: convergent-ai] participant: "guest_2369"
DEFAULT 2026-07-07T12:32:57.543007268Z [resource.labels.instanceId: convergent-ai] [12:32:57.487] [32mINFO[39m (103): [36mparticipantValue.trackPublications[39m
DEFAULT 2026-07-07T12:32:57.543031232Z [resource.labels.instanceId: convergent-ai] participantValue: "guest_2369"
DEFAULT 2026-07-07T12:32:57.543051584Z [resource.labels.instanceId: convergent-ai] trackPublications: []
DEFAULT 2026-07-07T12:32:57.543068686Z [resource.labels.instanceId: convergent-ai] lengthOfTrackPublications: 0
DEFAULT 2026-07-07T12:32:57.543085880Z [resource.labels.instanceId: convergent-ai] [12:32:57.491] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity_onEnter done[39m
DEFAULT 2026-07-07T12:32:57.543105683Z [resource.labels.instanceId: convergent-ai] [12:32:57.492] [34mDEBUG[39m (103): [36musing audio io: `RecorderAudioInput` -> `AgentSession` -> `RecorderAudioOutput`[39m
DEFAULT 2026-07-07T12:32:57.543129135Z [resource.labels.instanceId: convergent-ai] [12:32:57.493] [34mDEBUG[39m (103): [36musing transcript io: `AgentSession` -> `SyncedTextOutput`[39m
DEFAULT 2026-07-07T12:32:57.543150953Z [resource.labels.instanceId: convergent-ai] [12:32:57.505] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.tts_say started[39m
DEFAULT 2026-07-07T12:32:57.543170181Z [resource.labels.instanceId: convergent-ai] [12:32:57.508] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:32:57.543193401Z [resource.labels.instanceId: convergent-ai] [12:32:57.509] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:32:57.543228381Z [resource.labels.instanceId: convergent-ai] [12:32:57.512] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:32:57.543248696Z [resource.labels.instanceId: convergent-ai] [12:32:57.517] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:32:57.543278134Z [resource.labels.instanceId: convergent-ai] [12:32:57.530] [34mDEBUG[39m (103): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-07T12:32:58.011450461Z [resource.labels.instanceId: convergent-ai] [12:32:58.010] [34mDEBUG[39m (103): [36maec warmup active, disabling interruptions[39m
DEFAULT 2026-07-07T12:32:57.543278134Z [resource.labels.instanceId: convergent-ai] [12:32:57.530] [34mDEBUG[39m (103): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-07T12:32:58.011450461Z [resource.labels.instanceId: convergent-ai] [12:32:58.010] [34mDEBUG[39m (103): [36maec warmup active, disabling interruptions[39m
DEFAULT 2026-07-07T12:32:58.011598152Z [resource.labels.instanceId: convergent-ai] warmupDurationMs: 3000
DEFAULT 2026-07-07T12:32:58.011626133Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → speaking
DEFAULT 2026-07-07T12:32:58.302992531Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:32:59.138091515Z [resource.labels.instanceId: convergent-ai] [12:32:59.137] [32mINFO[39m (18): [36mreceived job request[39m
DEFAULT 2026-07-07T12:32:59.138272533Z [resource.labels.instanceId: convergent-ai] version: "1.4.7"
DEFAULT 2026-07-07T12:32:59.138328484Z [resource.labels.instanceId: convergent-ai] jobId: "AJ_KKbykDtAzKdA"
DEFAULT 2026-07-07T12:32:59.138361583Z [resource.labels.instanceId: convergent-ai] resuming: false
DEFAULT 2026-07-07T12:32:59.138403070Z [resource.labels.instanceId: convergent-ai] agentName: ""
DEFAULT 2026-07-07T12:32:59.596398561Z [resource.labels.instanceId: convergent-ai] [pipeline][12:32:59.596] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:32:59.598439316Z [resource.labels.instanceId: convergent-ai] [pipeline][12:32:59.596] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:32:59.603225420Z [resource.labels.instanceId: convergent-ai] [12:32:59.602] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:33:00.801593728Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:33:00.973518697Z [resource.labels.instanceId: convergent-ai] ◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
DEFAULT 2026-07-07T12:33:00.985356206Z [resource.labels.instanceId: convergent-ai] [12:33:00.980] [34mDEBUG[39m (774): [36minitializing job runner[39m
DEFAULT 2026-07-07T12:33:00.988035157Z [resource.labels.instanceId: convergent-ai] [12:33:00.985] [34mDEBUG[39m (774): [36mjob runner initialized[39m
DEFAULT 2026-07-07T12:33:00.991843165Z [resource.labels.instanceId: convergent-ai] [12:33:00.990] [34mDEBUG[39m (774): [36mjob started[39m
DEFAULT 2026-07-07T12:33:00.991975230Z [resource.labels.instanceId: convergent-ai] jobID: "AJ_KKbykDtAzKdA"
DEFAULT 2026-07-07T12:33:00.993107113Z [resource.labels.instanceId: convergent-ai] [agent]: Receiving job for room: undefined
DEFAULT 2026-07-07T12:33:00.993599989Z [resource.labels.instanceId: convergent-ai] [agent]: Loading VAD (minSilence=350ms)...
DEFAULT 2026-07-07T12:33:00.993832239Z [resource.labels.instanceId: convergent-ai] [agent]: Loading Cartesia STT/TTS (ink-2 / sonic-3.5)...
DEFAULT 2026-07-07T12:33:00.994401156Z [resource.labels.instanceId: convergent-ai] [agent]: Creating Cascaded agent (Cerebras LLM + Cartesia STT/TTS)...
DEFAULT 2026-07-07T12:33:00.995814110Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"prompt_size","label":"voice_static","estimatedTokens":2103,"contextLimit":32000,"pctOfLimit":"6.6%","forceCompactThreshold":6000}
DEFAULT 2026-07-07T12:33:00.995956836Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"prompt_size","label":"text_full","estimatedTokens":2103,"contextLimit":32000,"pctOfLimit":"6.6%","forceCompactThreshold":6000}
DEFAULT 2026-07-07T12:33:01.011515074Z [resource.labels.instanceId: convergent-ai] [12:33:01.011] [34mDEBUG[39m (103): [36maec warmup expired, re-enabling interruptions[39m
DEFAULT 2026-07-07T12:33:01.232261895Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427581231,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"Connect callback received"}
DEFAULT 2026-07-07T12:33:01.233165399Z [resource.labels.instanceId: convergent-ai] [agent]: Connected to room: room-g4xp43kcw
DEFAULT 2026-07-07T12:33:01.233351223Z [resource.labels.instanceId: convergent-ai] [agent]: Pre-starting session on connect...
DEFAULT 2026-07-07T12:33:01.234527944Z [resource.labels.instanceId: convergent-ai] [12:33:01.233] [34mDEBUG[39m (774): [36mConfiguring session recording (cloud tracer)[39m
DEFAULT 2026-07-07T12:33:01.234623198Z [resource.labels.instanceId: convergent-ai] jobId: "AJ_KKbykDtAzKdA"
DEFAULT 2026-07-07T12:33:01.234658250Z [resource.labels.instanceId: convergent-ai] roomName: "room-g4xp43kcw"
DEFAULT 2026-07-07T12:33:01.255377234Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Conversation item added: role=undefined, content="undefined"
DEFAULT 2026-07-07T12:33:01.255769399Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":0,"sessionAgeMs":262,"contextItemCount":1,"estimatedContextTokens":0}
DEFAULT 2026-07-07T12:33:01.293263288Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: initializing → listening
DEFAULT 2026-07-07T12:33:01.295587516Z [resource.labels.instanceId: convergent-ai] [agent]: Realtime session pre-started successfully.
DEFAULT 2026-07-07T12:33:01.308416089Z [resource.labels.instanceId: convergent-ai] [agent]: Sent SYSTEM_AGENT_READY signal.
DEFAULT 2026-07-07T12:33:01.308676854Z [resource.labels.instanceId: convergent-ai] [agent]: Ready — model=cascade-livekit-inference (Cerebras GPT-OSS 120B + Cartesia), prompt=mvp-1, compact@6 turns / 6000 tokens
DEFAULT 2026-07-07T12:33:01.364682619Z [resource.labels.instanceId: convergent-ai] [12:33:01.244] [33mWARN[39m (774): [36mtext stream handler for topic "lk.chat" already set, ignoring[39m
DEFAULT 2026-07-07T12:33:01.364801034Z [resource.labels.instanceId: convergent-ai] [12:33:01.248] [34mDEBUG[39m (774): [36mconnection state changed[39m
DEFAULT 2026-07-07T12:33:01.364839878Z [resource.labels.instanceId: convergent-ai] state: 1
DEFAULT 2026-07-07T12:33:01.364886714Z [resource.labels.instanceId: convergent-ai] [12:33:01.251] [33mWARN[39m (774): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-07T12:33:01.364927234Z [resource.labels.instanceId: convergent-ai] [12:33:01.252] [33mWARN[39m (774): [36mrotateSegment called while previous segment is still being rotated[39m
DEFAULT 2026-07-07T12:33:01.364973515Z [resource.labels.instanceId: convergent-ai] [12:33:01.253] [34mDEBUG[39m (774): [36mTask.runTask: task recorder_io_encode_task started[39m
DEFAULT 2026-07-07T12:33:01.365010414Z [resource.labels.instanceId: convergent-ai] [12:33:01.260] [34mDEBUG[39m (774): [36mAgent handoff inserted into chat context[39m
DEFAULT 2026-07-07T12:33:01.365044607Z [resource.labels.instanceId: convergent-ai] newAgentId: "ailana_voice_agent"
DEFAULT 2026-07-07T12:33:01.365071262Z [resource.labels.instanceId: convergent-ai] [12:33:01.275] [34mDEBUG[39m (774): [36mTask.runTask: task AgentActivity_onEnter started[39m
DEFAULT 2026-07-07T12:33:01.365099807Z [resource.labels.instanceId: convergent-ai] [12:33:01.291] [34mDEBUG[39m (774): [36mTask.runTask: task AgentActivity_onEnter done[39m
DEFAULT 2026-07-07T12:33:01.365138554Z [resource.labels.instanceId: convergent-ai] [12:33:01.291] [34mDEBUG[39m (774): [36musing audio io: `RecorderAudioInput` -> `AgentSession` -> `RecorderAudioOutput`[39m
DEFAULT 2026-07-07T12:33:01.365184297Z [resource.labels.instanceId: convergent-ai] [12:33:01.292] [34mDEBUG[39m (774): [36musing transcript io: `AgentSession` -> `SyncedTextOutput`[39m
DEFAULT 2026-07-07T12:33:01.365215659Z [resource.labels.instanceId: convergent-ai] [12:33:01.314] [34mDEBUG[39m (774): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-07T12:33:01.794655409Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:33:01.794424+00:00 convergent-ai CRON[215692]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-07T12:33:01.796718508Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:33:01.796505+00:00 convergent-ai CRON[215691]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-07T12:33:02.163835184Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582163,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176238727Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582164,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176368930Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582167,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176396534Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582167,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176434432Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582168,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176491166Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582168,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176532549Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582168,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176570295Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582168,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176611994Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582169,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:02.176653137Z [resource.labels.instanceId: convergent-ai] {"level":20,"time":1783427582170,"pid":774,"hostname":"c8f8f43380df","name":"lk-rtc","msg":"ignoring incoming text stream due to no handler for topic: lk.transcription"}
DEFAULT 2026-07-07T12:33:08.441253209Z [resource.labels.instanceId: convergent-ai] [12:33:08.440] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:33:09.460500792Z [resource.labels.instanceId: convergent-ai] [12:33:09.459] [33mWARN[39m (103): [36mInput is shorter by 548016 samples; silence has been prepended to align the input channel.[39m
DEFAULT 2026-07-07T12:33:09.472999880Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":1,"sessionAgeMs":13692,"contextItemCount":2,"estimatedContextTokens":55}
DEFAULT 2026-07-07T12:33:09.474793731Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:33:09.476806432Z [resource.labels.instanceId: convergent-ai] [12:33:09.475] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.tts_say done[39m
DEFAULT 2026-07-07T12:33:09.948950020Z [resource.labels.instanceId: convergent-ai] [12:33:09.948] [33mWARN[39m (103): [36minput speech hasn't started yet, skipping silence padding, recording may be inaccurate until the speech starts[39m
DEFAULT 2026-07-07T12:33:12.449551893Z [resource.labels.instanceId: convergent-ai] [12:33:12.448] [33mWARN[39m (103): [36minput speech hasn't started yet, skipping silence padding, recording may be inaccurate until the speech starts[39m
DEFAULT 2026-07-07T12:33:12.523896410Z [resource.labels.instanceId: convergent-ai] [12:33:12.523] [34mDEBUG[39m (103): [36monTrackSubscribed in _input[39m
DEFAULT 2026-07-07T12:33:12.524020609Z [resource.labels.instanceId: convergent-ai] participant: "guest_2369"
DEFAULT 2026-07-07T12:33:13.492078423Z [resource.labels.instanceId: convergent-ai] [12:33:13.491] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:13.739793936Z [resource.labels.instanceId: convergent-ai] [12:33:13.739] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:14.530082415Z [resource.labels.instanceId: convergent-ai] [12:33:14.529] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:14.530347134Z [resource.labels.instanceId: convergent-ai] transcript: "Hello"
DEFAULT 2026-07-07T12:33:14.858445948Z [resource.labels.instanceId: convergent-ai] [12:33:14.857] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:14.858577975Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Al"
DEFAULT 2026-07-07T12:33:14.874644036Z [resource.labels.instanceId: convergent-ai] [12:33:14.874] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:14.874780189Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how"
DEFAULT 2026-07-07T12:33:14.894854565Z [resource.labels.instanceId: convergent-ai] [12:33:14.894] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:14.894968541Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:14.909081506Z [resource.labels.instanceId: convergent-ai] [12:33:14.908] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:33:14.909218213Z [resource.labels.instanceId: convergent-ai] user_transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:14.909255391Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:14.910512848Z [resource.labels.instanceId: convergent-ai] [12:33:14.909] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:33:14.910668294Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:14.951276289Z [resource.labels.instanceId: convergent-ai] [12:33:14.950] [33mWARN[39m (103): [36minput speech started after last agent speech ended[39m
DEFAULT 2026-07-07T12:33:14.951398882Z [resource.labels.instanceId: convergent-ai] lastAgentSpeechTime: 1783427589432
DEFAULT 2026-07-07T12:33:14.951440759Z [resource.labels.instanceId: convergent-ai] inputStartedTime: 1783427592531
DEFAULT 2026-07-07T12:33:15.121843750Z [resource.labels.instanceId: convergent-ai] [12:33:15.121] [34mDEBUG[39m (103): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:15.148939337Z [resource.labels.instanceId: convergent-ai] [12:33:15.148] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:15.150647235Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:15.150] STT final transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.150774865Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:15.150] STT complete (-1ms): "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.154933999Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.155707955Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "borrower_name" is 1
DEFAULT 2026-07-07T12:33:15.162845250Z [resource.labels.instanceId: convergent-ai] [12:33:15.151] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:33:15.162938716Z [resource.labels.instanceId: convergent-ai] user_transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.162974798Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:15.163005324Z [resource.labels.instanceId: convergent-ai] [12:33:15.152] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:15.163043584Z [resource.labels.instanceId: convergent-ai] [12:33:15.153] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:33:15.163074633Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.163116999Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:33:15.163149102Z [resource.labels.instanceId: convergent-ai] [12:33:15.153] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:33:15.163179623Z [resource.labels.instanceId: convergent-ai] transcript: "Hello Alana, how are you?"
DEFAULT 2026-07-07T12:33:15.163228603Z [resource.labels.instanceId: convergent-ai] [12:33:15.154] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:33:15.163311055Z [resource.labels.instanceId: convergent-ai] [12:33:15.156] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:33:15.399195347Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:33:15.399540214Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:33:15.399540214Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:33:15.399598999Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=borrower_name
DEFAULT 2026-07-07T12:33:15.399728247Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:33:15.400560789Z [resource.labels.instanceId: convergent-ai] [12:33:15.400] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:33:15.400637296Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_15af9737-d81"
DEFAULT 2026-07-07T12:33:15.405674599Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":19625,"contextItemCount":3,"estimatedContextTokens":61,"userTurnEndAt":1783427595150}
DEFAULT 2026-07-07T12:33:15.406782694Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:33:15.414572580Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:15.414] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:33:15.418065401Z [resource.labels.instanceId: convergent-ai] [12:33:15.400] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:33:15.418176748Z [resource.labels.instanceId: convergent-ai] [12:33:15.402] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:33:15.418214399Z [resource.labels.instanceId: convergent-ai] [12:33:15.405] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:33:15.418251685Z [resource.labels.instanceId: convergent-ai] [12:33:15.406] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:33:15.418292774Z [resource.labels.instanceId: convergent-ai] [12:33:15.407] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:33:15.538389331Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:15.538] First chunk/token received (TTFT: 124ms)
DEFAULT 2026-07-07T12:33:15.575067273Z [resource.labels.instanceId: convergent-ai] [12:33:15.574] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:33:15.580182993Z [resource.labels.instanceId: convergent-ai] [12:33:15.576] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:33:15.580319650Z [resource.labels.instanceId: convergent-ai] [12:33:15.576] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:33:15.580373249Z [resource.labels.instanceId: convergent-ai] [12:33:15.577] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:33:15.592699883Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:15.592] Stream complete (Total: 178ms, chunks: 12)
DEFAULT 2026-07-07T12:33:15.593396182Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:15.593] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:33:15.593501483Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:15.593] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:33:15.593543230Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":19813,"contextItemCount":0,"estimatedContextTokens":1848,"ttftMs":169,"userTurnEndAt":1783427595150}
DEFAULT 2026-07-07T12:33:15.593701066Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:15.593] LLM metrics — TTFT=169ms prompt_tokens=1848 completion_tokens=60
DEFAULT 2026-07-07T12:33:15.596439858Z [resource.labels.instanceId: convergent-ai] [12:33:15.596] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:33:15.597374479Z [resource.labels.instanceId: convergent-ai] [12:33:15.596] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:33:15.597474729Z [resource.labels.instanceId: convergent-ai] [12:33:15.596] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:33:15.984219275Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:33:15.984332850Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":20204,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":834,"agentSpeakingAt":1783427595984,"userTurnEndAt":1783427595150}
DEFAULT 2026-07-07T12:33:16.569262436Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:16.569] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:33:16.569421285Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:16.569] ── TURN 2 SUMMARY ── stt_done=? llm_start=? llm_first_token=443ms llm_done=443ms tts_start=? tts_done=1419ms
DEFAULT 2026-07-07T12:33:16.569483254Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:16.569] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:33:16.571574395Z [resource.labels.instanceId: convergent-ai] [12:33:16.571] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:33:16.572159266Z [resource.labels.instanceId: convergent-ai] [12:33:16.571] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:33:19.379956400Z [resource.labels.instanceId: convergent-ai] [12:33:19.379] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:33:20.406502750Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":2,"sessionAgeMs":24626,"contextItemCount":4,"estimatedContextTokens":81,"userTurnEndAt":1783427595150}
DEFAULT 2026-07-07T12:33:20.408400952Z [resource.labels.instanceId: convergent-ai] [12:33:20.407] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:33:20.408534957Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_15af9737-d81"
DEFAULT 2026-07-07T12:33:20.408580266Z [resource.labels.instanceId: convergent-ai] message: "I’m doing great, thank you! To get us started, could you share your first name? "
DEFAULT 2026-07-07T12:33:20.408623781Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:33:20.410061258Z [resource.labels.instanceId: convergent-ai] [12:33:20.409] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:33:26.162989535Z [resource.labels.instanceId: convergent-ai] [12:33:26.162] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:26.380147778Z [resource.labels.instanceId: convergent-ai] [12:33:26.379] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:27.330002780Z [resource.labels.instanceId: convergent-ai] [12:33:27.329] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:27.330126238Z [resource.labels.instanceId: convergent-ai] transcript: "Yes"
DEFAULT 2026-07-07T12:33:27.499840713Z [resource.labels.instanceId: convergent-ai] [12:33:27.499] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:27.499973384Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, my"
DEFAULT 2026-07-07T12:33:27.659380162Z [resource.labels.instanceId: convergent-ai] [12:33:27.658] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:27.659529802Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, my name"
DEFAULT 2026-07-07T12:33:27.675652535Z [resource.labels.instanceId: convergent-ai] [12:33:27.675] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:27.675792130Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.693449615Z [resource.labels.instanceId: convergent-ai] [12:33:27.692] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:33:27.693606243Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.693649741Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:27.694563514Z [resource.labels.instanceId: convergent-ai] [12:33:27.693] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:33:27.694750799Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.789304761Z [resource.labels.instanceId: convergent-ai] [12:33:27.788] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:27.790864486Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:27.790] STT final transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.790987552Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:27.790] STT complete (-1ms): "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.796523291Z [resource.labels.instanceId: convergent-ai] [12:33:27.791] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:33:27.796660591Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.796701616Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:27.796736422Z [resource.labels.instanceId: convergent-ai] [12:33:27.793] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:33:27.796784049Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427606096.725
DEFAULT 2026-07-07T12:33:27.796830711Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:33:27.796910270Z [resource.labels.instanceId: convergent-ai] [12:33:27.793] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:27.796948714Z [resource.labels.instanceId: convergent-ai] [12:33:27.793] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:33:27.796991186Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.797028257Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:33:27.822681802Z [resource.labels.instanceId: convergent-ai] [12:33:27.822] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:33:27.822831097Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.823515886Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Yes, my name is John."
DEFAULT 2026-07-07T12:33:27.823852890Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "borrower_name" is 2
DEFAULT 2026-07-07T12:33:27.827605947Z [resource.labels.instanceId: convergent-ai] [12:33:27.822] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:33:27.827734993Z [resource.labels.instanceId: convergent-ai] [12:33:27.823] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:33:28.223438360Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:33:28.223589632Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=borrower_name
DEFAULT 2026-07-07T12:33:28.223625725Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:33:28.224164445Z [resource.labels.instanceId: convergent-ai] [12:33:28.223] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:33:28.224283067Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_25c38f8e-dde"
DEFAULT 2026-07-07T12:33:28.227161200Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":32446,"contextItemCount":5,"estimatedContextTokens":87,"userTurnEndAt":1783427607790}
DEFAULT 2026-07-07T12:33:28.228148133Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:33:28.229352049Z [resource.labels.instanceId: convergent-ai] [12:33:28.224] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:33:28.229472049Z [resource.labels.instanceId: convergent-ai] [12:33:28.224] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:33:28.229513663Z [resource.labels.instanceId: convergent-ai] [12:33:28.226] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:33:28.229555094Z [resource.labels.instanceId: convergent-ai] [12:33:28.227] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:33:28.229592005Z [resource.labels.instanceId: convergent-ai] [12:33:28.228] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:33:28.233251520Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:28.233] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:33:28.377239674Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:28.376] First chunk/token received (TTFT: 143ms)
DEFAULT 2026-07-07T12:33:28.417639699Z [resource.labels.instanceId: convergent-ai] [12:33:28.417] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:33:28.425009604Z [resource.labels.instanceId: convergent-ai] [12:33:28.418] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:33:28.425128731Z [resource.labels.instanceId: convergent-ai] [12:33:28.418] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:33:28.425160260Z [resource.labels.instanceId: convergent-ai] [12:33:28.419] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:33:28.426578831Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:28.426] Stream complete (Total: 193ms, chunks: 10)
DEFAULT 2026-07-07T12:33:28.427067392Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:28.426] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:33:28.427122888Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:28.426] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:33:28.427171881Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":32647,"contextItemCount":0,"estimatedContextTokens":1886,"ttftMs":191,"userTurnEndAt":1783427607790}
DEFAULT 2026-07-07T12:33:28.427209898Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:28.427] LLM metrics — TTFT=191ms prompt_tokens=1886 completion_tokens=61
DEFAULT 2026-07-07T12:33:28.429960977Z [resource.labels.instanceId: convergent-ai] [12:33:28.428] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:33:28.430080456Z [resource.labels.instanceId: convergent-ai] [12:33:28.429] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:33:28.430114968Z [resource.labels.instanceId: convergent-ai] [12:33:28.429] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:33:28.508652672Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:33:28.729477595Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:33:28.729618290Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":32949,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":939,"agentSpeakingAt":1783427608729,"userTurnEndAt":1783427607790}
DEFAULT 2026-07-07T12:33:29.910651645Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:29.910] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:33:29.910835847Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:29.910] ── TURN 3 SUMMARY ── stt_done=? llm_start=? llm_first_token=636ms llm_done=636ms tts_start=? tts_done=2120ms
DEFAULT 2026-07-07T12:33:29.910886131Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:29.910] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:33:29.912573351Z [resource.labels.instanceId: convergent-ai] [12:33:29.912] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:33:29.913398981Z [resource.labels.instanceId: convergent-ai] [12:33:29.912] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:33:36.190939256Z [resource.labels.instanceId: convergent-ai] [12:33:36.190] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:33:37.256850887Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":3,"sessionAgeMs":41476,"contextItemCount":6,"estimatedContextTokens":124,"userTurnEndAt":1783427607790}
DEFAULT 2026-07-07T12:33:37.258121431Z [resource.labels.instanceId: convergent-ai] [12:33:37.257] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:33:37.258237957Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_25c38f8e-dde"
DEFAULT 2026-07-07T12:33:37.258324955Z [resource.labels.instanceId: convergent-ai] message: "Nice to meet you, John! What’s your primary mortgage goal—are you looking to purchase a home, refinance an existing loan, or explore another option? "
DEFAULT 2026-07-07T12:33:37.258360993Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:33:37.259888004Z [resource.labels.instanceId: convergent-ai] [12:33:37.259] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:33:40.751193721Z [resource.labels.instanceId: convergent-ai] [12:33:40.750] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:40.929906276Z [resource.labels.instanceId: convergent-ai] [12:33:40.929] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:41.709455622Z [resource.labels.instanceId: convergent-ai] [12:33:41.708] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:41.709632109Z [resource.labels.instanceId: convergent-ai] transcript: "I'"
DEFAULT 2026-07-07T12:33:41.725738023Z [resource.labels.instanceId: convergent-ai] [12:33:41.725] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:41.725890398Z [resource.labels.instanceId: convergent-ai] transcript: "I'm"
DEFAULT 2026-07-07T12:33:41.880253858Z [resource.labels.instanceId: convergent-ai] [12:33:41.879] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:41.880396506Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just"
DEFAULT 2026-07-07T12:33:42.209631237Z [resource.labels.instanceId: convergent-ai] [12:33:42.209] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:42.209808337Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking"
DEFAULT 2026-07-07T12:33:42.370296038Z [resource.labels.instanceId: convergent-ai] [12:33:42.369] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:42.370429843Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to"
DEFAULT 2026-07-07T12:33:42.540712195Z [resource.labels.instanceId: convergent-ai] [12:33:42.540] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:42.540841374Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy"
DEFAULT 2026-07-07T12:33:42.699331851Z [resource.labels.instanceId: convergent-ai] [12:33:42.698] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:42.699489701Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a"
DEFAULT 2026-07-07T12:33:42.990632954Z [resource.labels.instanceId: convergent-ai] [12:33:42.990] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:42.990780604Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home"
DEFAULT 2026-07-07T12:33:43.159606366Z [resource.labels.instanceId: convergent-ai] [12:33:43.159] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:43.159735148Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for"
DEFAULT 2026-07-07T12:33:43.810594773Z [resource.labels.instanceId: convergent-ai] [12:33:43.810] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:43.810780221Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself"
DEFAULT 2026-07-07T12:33:44.440099204Z [resource.labels.instanceId: convergent-ai] [12:33:44.439] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:44.440237065Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh"
DEFAULT 2026-07-07T12:33:44.599954488Z [resource.labels.instanceId: convergent-ai] [12:33:44.599] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:44.600068669Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I"
DEFAULT 2026-07-07T12:33:44.930273634Z [resource.labels.instanceId: convergent-ai] [12:33:44.929] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:44.930425800Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just"
DEFAULT 2026-07-07T12:33:45.091818842Z [resource.labels.instanceId: convergent-ai] [12:33:45.091] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:45.091946428Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need"
DEFAULT 2026-07-07T12:33:45.260236351Z [resource.labels.instanceId: convergent-ai] [12:33:45.259] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:45.260366397Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a"
DEFAULT 2026-07-07T12:33:45.549231760Z [resource.labels.instanceId: convergent-ai] [12:33:45.548] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:45.549359566Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary"
DEFAULT 2026-07-07T12:33:45.720321489Z [resource.labels.instanceId: convergent-ai] [12:33:45.719] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:45.720443490Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence"
DEFAULT 2026-07-07T12:33:45.737020783Z [resource.labels.instanceId: convergent-ai] [12:33:45.736] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:45.737140528Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.739175944Z [resource.labels.instanceId: convergent-ai] [12:33:45.738] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:33:45.739296401Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.739344537Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:45.739380790Z [resource.labels.instanceId: convergent-ai] [12:33:45.738] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:33:45.739413742Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.800966884Z [resource.labels.instanceId: convergent-ai] [12:33:45.800] [34mDEBUG[39m (103): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:45.878847165Z [resource.labels.instanceId: convergent-ai] [12:33:45.878] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:45.880172333Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:45.879] STT final transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.880279950Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:45.880] STT complete (-1ms): "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.882849918Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.883125227Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "mortgage_goal" is 1
DEFAULT 2026-07-07T12:33:45.886491463Z [resource.labels.instanceId: convergent-ai] [12:33:45.880] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:33:45.886570086Z [resource.labels.instanceId: convergent-ai] user_transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.886609801Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:45.886643535Z [resource.labels.instanceId: convergent-ai] [12:33:45.881] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:45.886693347Z [resource.labels.instanceId: convergent-ai] [12:33:45.881] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:33:45.886726485Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.886749469Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:33:45.886770799Z [resource.labels.instanceId: convergent-ai] [12:33:45.882] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:33:45.886801919Z [resource.labels.instanceId: convergent-ai] transcript: "I'm just looking to buy a home for myself. Uh, I just need a primary residence."
DEFAULT 2026-07-07T12:33:45.886835865Z [resource.labels.instanceId: convergent-ai] [12:33:45.882] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:33:45.886871707Z [resource.labels.instanceId: convergent-ai] [12:33:45.882] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:33:46.203254866Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:33:46.203416192Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:33:46.203512927Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=existing_relationship
DEFAULT 2026-07-07T12:33:46.203635530Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:33:46.204189424Z [resource.labels.instanceId: convergent-ai] [12:33:46.203] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:33:46.204277947Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_33a83ba8-6cd"
DEFAULT 2026-07-07T12:33:46.207103385Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":50426,"contextItemCount":7,"estimatedContextTokens":144,"userTurnEndAt":1783427625880}
DEFAULT 2026-07-07T12:33:46.208084645Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:33:46.212545265Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:46.212] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:33:46.214334426Z [resource.labels.instanceId: convergent-ai] [12:33:46.204] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:33:46.214429053Z [resource.labels.instanceId: convergent-ai] [12:33:46.204] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:33:46.214483593Z [resource.labels.instanceId: convergent-ai] [12:33:46.206] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:33:46.214545389Z [resource.labels.instanceId: convergent-ai] [12:33:46.207] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:33:46.214583632Z [resource.labels.instanceId: convergent-ai] [12:33:46.208] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:33:46.459546995Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:46.459] First chunk/token received (TTFT: 247ms)
DEFAULT 2026-07-07T12:33:46.489661087Z [resource.labels.instanceId: convergent-ai] [12:33:46.489] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:33:46.494077287Z [resource.labels.instanceId: convergent-ai] [12:33:46.490] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:33:46.494195009Z [resource.labels.instanceId: convergent-ai] [12:33:46.491] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:33:46.494233547Z [resource.labels.instanceId: convergent-ai] [12:33:46.491] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:33:46.499187534Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:33:46.498] Stream complete (Total: 286ms, chunks: 7)
DEFAULT 2026-07-07T12:33:46.499549066Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:46.499] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:33:46.499644190Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:46.499] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:33:46.499798415Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":50719,"contextItemCount":0,"estimatedContextTokens":1942,"ttftMs":283,"userTurnEndAt":1783427625880}
DEFAULT 2026-07-07T12:33:46.499865132Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:46.499] LLM metrics — TTFT=283ms prompt_tokens=1942 completion_tokens=43
DEFAULT 2026-07-07T12:33:46.501405479Z [resource.labels.instanceId: convergent-ai] [12:33:46.501] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:33:46.502225724Z [resource.labels.instanceId: convergent-ai] [12:33:46.501] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:33:46.502313521Z [resource.labels.instanceId: convergent-ai] [12:33:46.501] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:33:46.801640510Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:33:46.801777309Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":51021,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":921,"agentSpeakingAt":1783427626801,"userTurnEndAt":1783427625880}
DEFAULT 2026-07-07T12:33:47.551120822Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:47.550] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:33:47.551257281Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:47.550] ── TURN 4 SUMMARY ── stt_done=? llm_start=? llm_first_token=619ms llm_done=619ms tts_start=? tts_done=1670ms
DEFAULT 2026-07-07T12:33:47.551302931Z [resource.labels.instanceId: convergent-ai] [pipeline][12:33:47.550] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:33:47.552991250Z [resource.labels.instanceId: convergent-ai] [12:33:47.552] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:33:47.553704698Z [resource.labels.instanceId: convergent-ai] [12:33:47.552] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:33:51.480432948Z [resource.labels.instanceId: convergent-ai] [12:33:51.479] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:33:52.509862847Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":4,"sessionAgeMs":56729,"contextItemCount":8,"estimatedContextTokens":173,"userTurnEndAt":1783427625880}
DEFAULT 2026-07-07T12:33:52.511153163Z [resource.labels.instanceId: convergent-ai] [12:33:52.510] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:33:52.511378931Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_33a83ba8-6cd"
DEFAULT 2026-07-07T12:33:52.511609902Z [resource.labels.instanceId: convergent-ai] message: "Got it, John. Are you already working with any lender or have an existing relationship with your lending institution? "
DEFAULT 2026-07-07T12:33:52.511668391Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:33:52.512657454Z [resource.labels.instanceId: convergent-ai] [12:33:52.512] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:33:56.651200428Z [resource.labels.instanceId: convergent-ai] [12:33:56.650] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:56.909752231Z [resource.labels.instanceId: convergent-ai] [12:33:56.909] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:33:57.570194225Z [resource.labels.instanceId: convergent-ai] [12:33:57.569] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:57.570319346Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-07T12:33:57.903662964Z [resource.labels.instanceId: convergent-ai] [12:33:57.903] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:57.903812778Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no"
DEFAULT 2026-07-07T12:33:58.030156911Z [resource.labels.instanceId: convergent-ai] [12:33:58.029] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:58.030288906Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this"
DEFAULT 2026-07-07T12:33:58.201429986Z [resource.labels.instanceId: convergent-ai] [12:33:58.200] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:58.201574464Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is"
DEFAULT 2026-07-07T12:33:58.359983085Z [resource.labels.instanceId: convergent-ai] [12:33:58.359] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:58.360118825Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my"
DEFAULT 2026-07-07T12:33:58.689975624Z [resource.labels.instanceId: convergent-ai] [12:33:58.689] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:58.690100300Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first"
DEFAULT 2026-07-07T12:33:59.024514440Z [resource.labels.instanceId: convergent-ai] [12:33:59.023] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.024653660Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time"
DEFAULT 2026-07-07T12:33:59.310102368Z [resource.labels.instanceId: convergent-ai] [12:33:59.309] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.310245855Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I"
DEFAULT 2026-07-07T12:33:59.639791714Z [resource.labels.instanceId: convergent-ai] [12:33:59.639] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.639946381Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don'"
DEFAULT 2026-07-07T12:33:59.657077050Z [resource.labels.instanceId: convergent-ai] [12:33:59.656] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.657206758Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't"
DEFAULT 2026-07-07T12:33:59.800272932Z [resource.labels.instanceId: convergent-ai] [12:33:59.799] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.800404160Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't have"
DEFAULT 2026-07-07T12:33:59.970494262Z [resource.labels.instanceId: convergent-ai] [12:33:59.969] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.970628488Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't have any"
DEFAULT 2026-07-07T12:33:59.987787122Z [resource.labels.instanceId: convergent-ai] [12:33:59.987] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:33:59.987926147Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:33:59.990810689Z [resource.labels.instanceId: convergent-ai] [12:33:59.989] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:33:59.990950985Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:33:59.990989928Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:33:59.991026332Z [resource.labels.instanceId: convergent-ai] [12:33:59.989] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:33:59.991054650Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.130083651Z [resource.labels.instanceId: convergent-ai] [12:34:00.129] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:00.132546787Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:00.131] STT final transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.132662937Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:00.131] STT complete (-1ms): "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.135875714Z [resource.labels.instanceId: convergent-ai] [12:34:00.132] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:00.136020551Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.136060611Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:00.136091709Z [resource.labels.instanceId: convergent-ai] [12:34:00.133] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:34:00.136123386Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427636586.7358
DEFAULT 2026-07-07T12:34:00.136151841Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:34:00.136205488Z [resource.labels.instanceId: convergent-ai] [12:34:00.134] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:00.136249414Z [resource.labels.instanceId: convergent-ai] [12:34:00.134] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:00.136287339Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.136319943Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:00.263331856Z [resource.labels.instanceId: convergent-ai] [12:34:00.262] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:34:00.263485451Z [resource.labels.instanceId: convergent-ai] transcript: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.264017241Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh, no, this is my first time. I don't have any relations."
DEFAULT 2026-07-07T12:34:00.264409057Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "existing_relationship" is 1
DEFAULT 2026-07-07T12:34:00.267130547Z [resource.labels.instanceId: convergent-ai] [12:34:00.263] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:34:00.267257620Z [resource.labels.instanceId: convergent-ai] [12:34:00.264] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:34:00.664677738Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:34:00.664798195Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=existing_relationship
DEFAULT 2026-07-07T12:34:00.665071708Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:34:00.665699413Z [resource.labels.instanceId: convergent-ai] [12:34:00.665] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:34:00.665776593Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_ed19d520-cc3"
DEFAULT 2026-07-07T12:34:00.668831121Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":64888,"contextItemCount":9,"estimatedContextTokens":188,"userTurnEndAt":1783427640131}
DEFAULT 2026-07-07T12:34:00.669815390Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:34:00.671059116Z [resource.labels.instanceId: convergent-ai] [12:34:00.665] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:34:00.671165784Z [resource.labels.instanceId: convergent-ai] [12:34:00.666] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:34:00.671212746Z [resource.labels.instanceId: convergent-ai] [12:34:00.668] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:34:00.671270297Z [resource.labels.instanceId: convergent-ai] [12:34:00.669] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:34:00.671309487Z [resource.labels.instanceId: convergent-ai] [12:34:00.670] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:34:00.674799073Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:00.674] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:34:00.811387450Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:00.811] First chunk/token received (TTFT: 137ms)
DEFAULT 2026-07-07T12:34:00.834046698Z [resource.labels.instanceId: convergent-ai] [12:34:00.833] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:34:00.838915962Z [resource.labels.instanceId: convergent-ai] [12:34:00.835] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:34:00.839060675Z [resource.labels.instanceId: convergent-ai] [12:34:00.835] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:34:00.839104746Z [resource.labels.instanceId: convergent-ai] [12:34:00.835] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:34:00.853209010Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:00.852] Stream complete (Total: 178ms, chunks: 9)
DEFAULT 2026-07-07T12:34:00.853535725Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:00.853] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:34:00.853612757Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:00.853] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:34:00.853657598Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":65073,"contextItemCount":0,"estimatedContextTokens":1991,"ttftMs":165,"userTurnEndAt":1783427640131}
DEFAULT 2026-07-07T12:34:00.853695680Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:00.853] LLM metrics — TTFT=165ms prompt_tokens=1991 completion_tokens=49
DEFAULT 2026-07-07T12:34:00.855329646Z [resource.labels.instanceId: convergent-ai] [12:34:00.854] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:34:00.856354325Z [resource.labels.instanceId: convergent-ai] [12:34:00.855] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:34:00.856443872Z [resource.labels.instanceId: convergent-ai] [12:34:00.855] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:34:00.861456883Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:34:01.291881899Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:34:01.292010442Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":65511,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1160,"agentSpeakingAt":1783427641291,"userTurnEndAt":1783427640131}
DEFAULT 2026-07-07T12:34:01.804136009Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:34:01.803908+00:00 convergent-ai CRON[215705]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-07T12:34:01.804141210Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:34:01.803965+00:00 convergent-ai CRON[215704]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-07T12:34:02.160705838Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:02.160] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:34:02.160834394Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:02.160] ── TURN 5 SUMMARY ── stt_done=? llm_start=? llm_first_token=722ms llm_done=722ms tts_start=? tts_done=2029ms
DEFAULT 2026-07-07T12:34:02.160881050Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:02.160] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:34:02.162833381Z [resource.labels.instanceId: convergent-ai] [12:34:02.162] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:34:02.163516251Z [resource.labels.instanceId: convergent-ai] [12:34:02.162] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:34:06.450358435Z [resource.labels.instanceId: convergent-ai] [12:34:06.449] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:34:07.482632482Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":5,"sessionAgeMs":71702,"contextItemCount":10,"estimatedContextTokens":221,"userTurnEndAt":1783427640131}
DEFAULT 2026-07-07T12:34:07.484053326Z [resource.labels.instanceId: convergent-ai] [12:34:07.483] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:34:07.484191650Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_ed19d520-cc3"
DEFAULT 2026-07-07T12:34:07.484228789Z [resource.labels.instanceId: convergent-ai] message: "Thanks for letting me know. When are you hoping to move forward with purchasing your home—do you have a specific timeframe in mind? "
DEFAULT 2026-07-07T12:34:07.484265074Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:34:07.485639742Z [resource.labels.instanceId: convergent-ai] [12:34:07.485] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:34:12.061827200Z [resource.labels.instanceId: convergent-ai] [12:34:12.061] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:12.279416516Z [resource.labels.instanceId: convergent-ai] [12:34:12.278] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:12.940003420Z [resource.labels.instanceId: convergent-ai] [12:34:12.939] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:12.940127014Z [resource.labels.instanceId: convergent-ai] transcript: "I"
DEFAULT 2026-07-07T12:34:13.100178128Z [resource.labels.instanceId: convergent-ai] [12:34:13.099] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.100305537Z [resource.labels.instanceId: convergent-ai] transcript: "I just"
DEFAULT 2026-07-07T12:34:13.229718823Z [resource.labels.instanceId: convergent-ai] [12:34:13.229] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.229869370Z [resource.labels.instanceId: convergent-ai] transcript: "I just want"
DEFAULT 2026-07-07T12:34:13.400297623Z [resource.labels.instanceId: convergent-ai] [12:34:13.399] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.400414053Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to"
DEFAULT 2026-07-07T12:34:13.563161342Z [resource.labels.instanceId: convergent-ai] [12:34:13.562] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.563289880Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do"
DEFAULT 2026-07-07T12:34:13.729885091Z [resource.labels.instanceId: convergent-ai] [12:34:13.729] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.730030970Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it"
DEFAULT 2026-07-07T12:34:13.891166020Z [resource.labels.instanceId: convergent-ai] [12:34:13.890] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:13.891301594Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as"
DEFAULT 2026-07-07T12:34:14.059001437Z [resource.labels.instanceId: convergent-ai] [12:34:14.058] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:14.059141494Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon"
DEFAULT 2026-07-07T12:34:14.220815543Z [resource.labels.instanceId: convergent-ai] [12:34:14.220] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:14.220958793Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as"
DEFAULT 2026-07-07T12:34:14.380874451Z [resource.labels.instanceId: convergent-ai] [12:34:14.380] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:14.381012125Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible"
DEFAULT 2026-07-07T12:34:14.397916636Z [resource.labels.instanceId: convergent-ai] [12:34:14.397] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:14.398074345Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.400561284Z [resource.labels.instanceId: convergent-ai] [12:34:14.399] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:34:14.400694781Z [resource.labels.instanceId: convergent-ai] user_transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.400758094Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:14.400790069Z [resource.labels.instanceId: convergent-ai] [12:34:14.399] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:34:14.400824468Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.461392657Z [resource.labels.instanceId: convergent-ai] [12:34:14.460] [34mDEBUG[39m (103): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:14.510191818Z [resource.labels.instanceId: convergent-ai] [12:34:14.509] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:14.511427241Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:14.511] STT final transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.511550378Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:14.511] STT complete (-1ms): "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.514006525Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.514296408Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "timeline" is 1
DEFAULT 2026-07-07T12:34:14.516916702Z [resource.labels.instanceId: convergent-ai] [12:34:14.511] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:14.517035383Z [resource.labels.instanceId: convergent-ai] user_transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.517068896Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:14.517108657Z [resource.labels.instanceId: convergent-ai] [12:34:14.512] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:14.517141129Z [resource.labels.instanceId: convergent-ai] [12:34:14.513] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:14.517172142Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.517207170Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:14.517241302Z [resource.labels.instanceId: convergent-ai] [12:34:14.513] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:34:14.517270557Z [resource.labels.instanceId: convergent-ai] transcript: "I just want to do it as soon as possible."
DEFAULT 2026-07-07T12:34:14.517302218Z [resource.labels.instanceId: convergent-ai] [12:34:14.513] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:34:14.517348884Z [resource.labels.instanceId: convergent-ai] [12:34:14.513] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:34:14.914551214Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:34:14.914691841Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=timeline
DEFAULT 2026-07-07T12:34:14.914731702Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:34:14.915118276Z [resource.labels.instanceId: convergent-ai] [12:34:14.914] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:34:14.915220244Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_2816804e-da9"
DEFAULT 2026-07-07T12:34:14.918111335Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":79137,"contextItemCount":11,"estimatedContextTokens":231,"userTurnEndAt":1783427654511}
DEFAULT 2026-07-07T12:34:14.919232944Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:34:14.920356850Z [resource.labels.instanceId: convergent-ai] [12:34:14.915] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:34:14.920455079Z [resource.labels.instanceId: convergent-ai] [12:34:14.915] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:34:14.920506897Z [resource.labels.instanceId: convergent-ai] [12:34:14.917] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:34:14.920553578Z [resource.labels.instanceId: convergent-ai] [12:34:14.918] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:34:14.920594723Z [resource.labels.instanceId: convergent-ai] [12:34:14.919] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:34:14.924082163Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:14.923] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:34:14.934765098Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:34:15.070164159Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:15.069] First chunk/token received (TTFT: 146ms)
DEFAULT 2026-07-07T12:34:15.122899189Z [resource.labels.instanceId: convergent-ai] [12:34:15.122] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:34:15.139690130Z [resource.labels.instanceId: convergent-ai] [12:34:15.123] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:34:15.139814041Z [resource.labels.instanceId: convergent-ai] [12:34:15.124] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:34:15.139867053Z [resource.labels.instanceId: convergent-ai] [12:34:15.124] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:34:15.161757687Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:15.161] Stream complete (Total: 238ms, chunks: 15)
DEFAULT 2026-07-07T12:34:15.162119590Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:15.161] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:34:15.162196438Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:15.162] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:34:15.162234411Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":79382,"contextItemCount":0,"estimatedContextTokens":2037,"ttftMs":205,"userTurnEndAt":1783427654511}
DEFAULT 2026-07-07T12:34:15.162559248Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:15.162] LLM metrics — TTFT=205ms prompt_tokens=2037 completion_tokens=88
DEFAULT 2026-07-07T12:34:15.164107063Z [resource.labels.instanceId: convergent-ai] [12:34:15.163] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:34:15.167613097Z [resource.labels.instanceId: convergent-ai] [12:34:15.164] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:34:15.167698110Z [resource.labels.instanceId: convergent-ai] [12:34:15.164] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:34:15.443371517Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:34:15.443525726Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":79663,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":932,"agentSpeakingAt":1783427655443,"userTurnEndAt":1783427654511}
DEFAULT 2026-07-07T12:34:16.469650254Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:16.469] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:34:16.469789325Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:16.469] ── TURN 6 SUMMARY ── stt_done=? llm_start=? llm_first_token=650ms llm_done=651ms tts_start=? tts_done=1958ms
DEFAULT 2026-07-07T12:34:16.469832757Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:16.469] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:34:16.471502168Z [resource.labels.instanceId: convergent-ai] [12:34:16.471] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:34:16.472126809Z [resource.labels.instanceId: convergent-ai] [12:34:16.471] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:34:22.039841622Z [resource.labels.instanceId: convergent-ai] [12:34:22.039] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:34:23.077540907Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":6,"sessionAgeMs":87297,"contextItemCount":12,"estimatedContextTokens":267,"userTurnEndAt":1783427654511}
DEFAULT 2026-07-07T12:34:23.079125100Z [resource.labels.instanceId: convergent-ai] [12:34:23.078] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:34:23.079364355Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_2816804e-da9"
DEFAULT 2026-07-07T12:34:23.079411461Z [resource.labels.instanceId: convergent-ai] message: "Understood, John—aiming to get into your new home quickly. Will anyone else be applying for the mortgage with you, such as a spouse or partner? "
DEFAULT 2026-07-07T12:34:23.079682613Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:34:23.080724561Z [resource.labels.instanceId: convergent-ai] [12:34:23.080] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:34:27.522253670Z [resource.labels.instanceId: convergent-ai] [12:34:27.521] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:27.808973682Z [resource.labels.instanceId: convergent-ai] [12:34:27.808] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:28.430800843Z [resource.labels.instanceId: convergent-ai] [12:34:28.430] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:28.430945544Z [resource.labels.instanceId: convergent-ai] transcript: "No"
DEFAULT 2026-07-07T12:34:28.599799002Z [resource.labels.instanceId: convergent-ai] [12:34:28.599] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:28.599958670Z [resource.labels.instanceId: convergent-ai] transcript: "No, I"
DEFAULT 2026-07-07T12:34:28.617815012Z [resource.labels.instanceId: convergent-ai] [12:34:28.617] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:28.617964647Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm"
DEFAULT 2026-07-07T12:34:28.760988400Z [resource.labels.instanceId: convergent-ai] [12:34:28.760] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:28.761120436Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm just"
DEFAULT 2026-07-07T12:34:28.777591062Z [resource.labels.instanceId: convergent-ai] [12:34:28.777] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:28.777727382Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.794863392Z [resource.labels.instanceId: convergent-ai] [12:34:28.794] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:34:28.794981422Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.795043562Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:28.795827225Z [resource.labels.instanceId: convergent-ai] [12:34:28.794] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:34:28.795925713Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.929087960Z [resource.labels.instanceId: convergent-ai] [12:34:28.928] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:28.930447294Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:28.930] STT final transcript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.930575147Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:28.930] STT complete (-1ms): "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.934499888Z [resource.labels.instanceId: convergent-ai] [12:34:28.930] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:28.934616936Z [resource.labels.instanceId: convergent-ai] user_transcript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.934657079Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:28.934687838Z [resource.labels.instanceId: convergent-ai] [12:34:28.932] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:34:28.934780973Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427667456.9148
DEFAULT 2026-07-07T12:34:28.934822541Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:34:28.934912109Z [resource.labels.instanceId: convergent-ai] [12:34:28.932] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:28.934951697Z [resource.labels.instanceId: convergent-ai] [12:34:28.932] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:28.934984957Z [resource.labels.instanceId: convergent-ai] audioTranscript: "No, I'm just doing it."
DEFAULT 2026-07-07T12:34:28.935024913Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:29.098195559Z [resource.labels.instanceId: convergent-ai] [12:34:29.097] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:29.151610018Z [resource.labels.instanceId: convergent-ai] [12:34:29.151] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:29.420163188Z [resource.labels.instanceId: convergent-ai] [12:34:29.419] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:29.420298354Z [resource.labels.instanceId: convergent-ai] transcript: "alone"
DEFAULT 2026-07-07T12:34:29.436765582Z [resource.labels.instanceId: convergent-ai] [12:34:29.436] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:29.436906368Z [resource.labels.instanceId: convergent-ai] transcript: "alone."
DEFAULT 2026-07-07T12:34:29.439355355Z [resource.labels.instanceId: convergent-ai] [12:34:29.438] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:34:29.439502459Z [resource.labels.instanceId: convergent-ai] user_transcript: "alone."
DEFAULT 2026-07-07T12:34:29.439559902Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:29.439598615Z [resource.labels.instanceId: convergent-ai] [12:34:29.438] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:34:29.439635229Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm just doing it. alone."
DEFAULT 2026-07-07T12:34:29.548974528Z [resource.labels.instanceId: convergent-ai] [12:34:29.548] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:29.550366387Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:29.550] STT final transcript: "alone."
DEFAULT 2026-07-07T12:34:29.550512933Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:29.550] STT complete (-1ms): "alone."
DEFAULT 2026-07-07T12:34:29.554196210Z [resource.labels.instanceId: convergent-ai] [12:34:29.550] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:29.554327794Z [resource.labels.instanceId: convergent-ai] user_transcript: "alone."
DEFAULT 2026-07-07T12:34:29.554369197Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:29.554408446Z [resource.labels.instanceId: convergent-ai] [12:34:29.552] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:34:29.554448933Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427667456.9148
DEFAULT 2026-07-07T12:34:29.554501634Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:34:29.554544521Z [resource.labels.instanceId: convergent-ai] [12:34:29.552] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:29.554581793Z [resource.labels.instanceId: convergent-ai] [12:34:29.552] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:29.554622853Z [resource.labels.instanceId: convergent-ai] audioTranscript: "No, I'm just doing it. alone."
DEFAULT 2026-07-07T12:34:29.554660213Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:29.761579321Z [resource.labels.instanceId: convergent-ai] [12:34:29.761] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:34:29.761723309Z [resource.labels.instanceId: convergent-ai] transcript: "No, I'm just doing it. alone."
DEFAULT 2026-07-07T12:34:29.762271354Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "No, I'm just doing it. alone."
DEFAULT 2026-07-07T12:34:29.762588440Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "co_borrower" is 1
DEFAULT 2026-07-07T12:34:29.765507011Z [resource.labels.instanceId: convergent-ai] [12:34:29.761] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:34:29.765632538Z [resource.labels.instanceId: convergent-ai] [12:34:29.762] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:34:30.167124480Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:34:30.167356743Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=1, pendingField=co_borrower
DEFAULT 2026-07-07T12:34:30.167432570Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:34:30.167905300Z [resource.labels.instanceId: convergent-ai] [12:34:30.167] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:34:30.168002582Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_e0b4bc33-259"
DEFAULT 2026-07-07T12:34:30.170980324Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":94390,"contextItemCount":13,"estimatedContextTokens":274,"userTurnEndAt":1783427669550}
DEFAULT 2026-07-07T12:34:30.172189774Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:34:30.173469356Z [resource.labels.instanceId: convergent-ai] [12:34:30.167] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:34:30.173555521Z [resource.labels.instanceId: convergent-ai] [12:34:30.168] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:34:30.173594703Z [resource.labels.instanceId: convergent-ai] [12:34:30.170] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:34:30.173630587Z [resource.labels.instanceId: convergent-ai] [12:34:30.171] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:34:30.173690082Z [resource.labels.instanceId: convergent-ai] [12:34:30.172] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:34:30.177577755Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:30.177] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:34:30.276059947Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:34:30.276238828Z [resource.labels.instanceId: convergent-ai] [context-manager]: Ã¢Å“â€¦ Transitioning to STAGE 2 Pre-Qualification Discovery!
DEFAULT 2026-07-07T12:34:30.341218493Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:30.340] First chunk/token received (TTFT: 163ms)
DEFAULT 2026-07-07T12:34:30.426124302Z [resource.labels.instanceId: convergent-ai] [12:34:30.425] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:34:30.431969925Z [resource.labels.instanceId: convergent-ai] [12:34:30.427] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:34:30.432118598Z [resource.labels.instanceId: convergent-ai] [12:34:30.427] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:34:30.432164028Z [resource.labels.instanceId: convergent-ai] [12:34:30.427] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:34:30.433280328Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:30.433] Stream complete (Total: 256ms, chunks: 13)
DEFAULT 2026-07-07T12:34:30.433678943Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:30.433] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:34:30.433748952Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:30.433] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:34:30.433802041Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":94653,"contextItemCount":0,"estimatedContextTokens":2091,"ttftMs":255,"userTurnEndAt":1783427669550}
DEFAULT 2026-07-07T12:34:30.433868439Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:30.433] LLM metrics — TTFT=255ms prompt_tokens=2091 completion_tokens=86
DEFAULT 2026-07-07T12:34:30.436252272Z [resource.labels.instanceId: convergent-ai] [12:34:30.435] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:34:30.436395429Z [resource.labels.instanceId: convergent-ai] [12:34:30.435] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:34:30.436453090Z [resource.labels.instanceId: convergent-ai] [12:34:30.435] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:34:30.743757149Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:34:30.743927788Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":94963,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1193,"agentSpeakingAt":1783427670743,"userTurnEndAt":1783427669550}
DEFAULT 2026-07-07T12:34:31.177780264Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:31.177] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:34:31.177951775Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:31.177] ── TURN 8 SUMMARY ── stt_done=? llm_start=? llm_first_token=883ms llm_done=883ms tts_start=? tts_done=1627ms
DEFAULT 2026-07-07T12:34:31.178011063Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:31.177] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:34:31.179973160Z [resource.labels.instanceId: convergent-ai] [12:34:31.179] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:34:31.180804467Z [resource.labels.instanceId: convergent-ai] [12:34:31.179] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:34:33.180601001Z [resource.labels.instanceId: convergent-ai] [12:34:33.179] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:34:34.195141671Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":98414,"contextItemCount":14,"estimatedContextTokens":289,"userTurnEndAt":1783427669550}
DEFAULT 2026-07-07T12:34:34.196561015Z [resource.labels.instanceId: convergent-ai] [12:34:34.195] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:34:34.196700822Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_e0b4bc33-259"
DEFAULT 2026-07-07T12:34:34.196742766Z [resource.labels.instanceId: convergent-ai] message: "Got it, John. I’ve noted that you’ll be the sole applicant. "
DEFAULT 2026-07-07T12:34:34.196784297Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:34:34.197238490Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":289,"itemCount":14,"action":"compact_start","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-07T12:34:34.199329541Z [resource.labels.instanceId: convergent-ai] [12:34:34.198] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:34:34.404120834Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"context_compaction","itemsBefore":14,"itemsAfter":10,"turnNumber":8,"sessionAgeMs":98623}
DEFAULT 2026-07-07T12:34:34.404249481Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":8,"sessionAgeMs":98624,"contextItemCount":10,"estimatedContextTokens":219,"userTurnEndAt":1783427669550}
DEFAULT 2026-07-07T12:34:34.404309786Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-context-budget","event":"session_context","inputTokens":0,"estimatedTextTokens":219,"itemCount":10,"action":"compact_done","forceCompactThreshold":6000,"overLatencyThreshold":false,"nearHardLimit":false}
DEFAULT 2026-07-07T12:34:34.404352173Z [resource.labels.instanceId: convergent-ai] [context]: Compacted 14Ã¢â€ â€™10 items, ~289Ã¢â€ â€™219 text tokens (last API input: 0)
DEFAULT 2026-07-07T12:34:41.961367445Z [resource.labels.instanceId: convergent-ai] [12:34:41.960] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:42.189638123Z [resource.labels.instanceId: convergent-ai] [12:34:42.189] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:42.682529623Z [resource.labels.instanceId: convergent-ai] [12:34:42.681] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:42.682648762Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-07T12:34:43.477132264Z [resource.labels.instanceId: convergent-ai] [12:34:43.476] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:43.477256356Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah"
DEFAULT 2026-07-07T12:34:43.807851044Z [resource.labels.instanceId: convergent-ai] [12:34:43.807] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:43.807985952Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I"
DEFAULT 2026-07-07T12:34:43.816892583Z [resource.labels.instanceId: convergent-ai] [12:34:43.816] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:43.817046994Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I'm"
DEFAULT 2026-07-07T12:34:43.969937018Z [resource.labels.instanceId: convergent-ai] [12:34:43.969] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:43.970090778Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I'm the"
DEFAULT 2026-07-07T12:34:43.986201472Z [resource.labels.instanceId: convergent-ai] [12:34:43.985] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:43.986340712Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.005350879Z [resource.labels.instanceId: convergent-ai] [12:34:44.004] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:34:44.005498478Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.005549359Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:44.006204395Z [resource.labels.instanceId: convergent-ai] [12:34:44.005] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:34:44.006305580Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.129708807Z [resource.labels.instanceId: convergent-ai] [12:34:44.129] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:44.130996755Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:44.130] STT final transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.131132287Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:44.130] STT complete (-1ms): "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.134641334Z [resource.labels.instanceId: convergent-ai] [12:34:44.131] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:44.134757642Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.134791256Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:44.134830822Z [resource.labels.instanceId: convergent-ai] [12:34:44.132] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:34:44.134867320Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427681896.5896
DEFAULT 2026-07-07T12:34:44.134912918Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:34:44.134948679Z [resource.labels.instanceId: convergent-ai] [12:34:44.133] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:44.134980743Z [resource.labels.instanceId: convergent-ai] [12:34:44.133] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:44.135012517Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.135055666Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:44.331492094Z [resource.labels.instanceId: convergent-ai] [12:34:44.330] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:34:44.331624819Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.332120222Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yeah, I'm the sole applicant."
DEFAULT 2026-07-07T12:34:44.332367750Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "gross_annual_income" is 1
DEFAULT 2026-07-07T12:34:44.335365953Z [resource.labels.instanceId: convergent-ai] [12:34:44.331] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:34:44.335507026Z [resource.labels.instanceId: convergent-ai] [12:34:44.332] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:34:44.645319582Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:34:44.645753382Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:34:44.645828629Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=gross_annual_income
DEFAULT 2026-07-07T12:34:44.645870362Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:34:44.646341671Z [resource.labels.instanceId: convergent-ai] [12:34:44.645] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:34:44.646433685Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_e80d122e-3fe"
DEFAULT 2026-07-07T12:34:44.649003253Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":108868,"contextItemCount":15,"estimatedContextTokens":297,"userTurnEndAt":1783427684130}
DEFAULT 2026-07-07T12:34:44.649894015Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:34:44.654380996Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:44.654] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:34:44.656041982Z [resource.labels.instanceId: convergent-ai] [12:34:44.646] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:34:44.656128207Z [resource.labels.instanceId: convergent-ai] [12:34:44.647] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:34:44.656171119Z [resource.labels.instanceId: convergent-ai] [12:34:44.648] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:34:44.656234428Z [resource.labels.instanceId: convergent-ai] [12:34:44.649] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:34:44.656273553Z [resource.labels.instanceId: convergent-ai] [12:34:44.650] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:34:44.803858857Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:44.803] First chunk/token received (TTFT: 149ms)
DEFAULT 2026-07-07T12:34:44.852881240Z [resource.labels.instanceId: convergent-ai] [12:34:44.852] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:34:44.857652722Z [resource.labels.instanceId: convergent-ai] [12:34:44.853] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:34:44.857813565Z [resource.labels.instanceId: convergent-ai] [12:34:44.854] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:34:44.857848568Z [resource.labels.instanceId: convergent-ai] [12:34:44.854] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:34:44.870811960Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:44.870] Stream complete (Total: 216ms, chunks: 11)
DEFAULT 2026-07-07T12:34:44.871166670Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:44.871] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:34:44.871268464Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:44.871] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:34:44.871312833Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":109091,"contextItemCount":0,"estimatedContextTokens":3257,"ttftMs":204,"userTurnEndAt":1783427684130}
DEFAULT 2026-07-07T12:34:44.871396105Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:44.871] LLM metrics — TTFT=204ms prompt_tokens=3257 completion_tokens=74
DEFAULT 2026-07-07T12:34:44.872929729Z [resource.labels.instanceId: convergent-ai] [12:34:44.872] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:34:44.873673347Z [resource.labels.instanceId: convergent-ai] [12:34:44.872] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:34:44.873812820Z [resource.labels.instanceId: convergent-ai] [12:34:44.872] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:34:45.263950538Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:34:45.265501407Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":109484,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1133,"agentSpeakingAt":1783427685263,"userTurnEndAt":1783427684130}
DEFAULT 2026-07-07T12:34:45.351897522Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:34:46.704777165Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:46.704] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:34:46.704892563Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:46.704] ── TURN 9 SUMMARY ── stt_done=? llm_start=? llm_first_token=741ms llm_done=741ms tts_start=? tts_done=2574ms
DEFAULT 2026-07-07T12:34:46.704955266Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:46.704] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:34:46.706362793Z [resource.labels.instanceId: convergent-ai] [12:34:46.705] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:34:46.706963990Z [resource.labels.instanceId: convergent-ai] [12:34:46.706] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:34:47.352733777Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:34:49.849844208Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:34:50.610734338Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:34:52.616548728Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:34:53.840699903Z [resource.labels.instanceId: convergent-ai] [12:34:53.840] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:34:53.951962054Z [resource.labels.instanceId: convergent-ai] [12:34:53.951] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:54.210745626Z [resource.labels.instanceId: convergent-ai] [12:34:54.210] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:54.241703777Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:34:54.293322461Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":9,"sessionAgeMs":118513,"contextItemCount":16,"estimatedContextTokens":345,"userTurnEndAt":1783427684130}
DEFAULT 2026-07-07T12:34:54.294580418Z [resource.labels.instanceId: convergent-ai] [12:34:54.294] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:34:54.294682683Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_e80d122e-3fe"
DEFAULT 2026-07-07T12:34:54.294724702Z [resource.labels.instanceId: convergent-ai] message: "Just to confirm — you mentioned you’ll be the sole applicant. Is that right? Great, thanks for confirming. Could you share your gross annual household income before taxes? (A range is fine.) "
DEFAULT 2026-07-07T12:34:54.329345402Z [resource.labels.instanceId: convergent-ai] [12:34:54.294] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:34:54.829413118Z [resource.labels.instanceId: convergent-ai] [12:34:54.828] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:54.829559832Z [resource.labels.instanceId: convergent-ai] transcript: "Yes"
DEFAULT 2026-07-07T12:34:54.846060710Z [resource.labels.instanceId: convergent-ai] [12:34:54.845] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:34:54.846174088Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:54.863175438Z [resource.labels.instanceId: convergent-ai] [12:34:54.862] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:34:54.863303603Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:54.863357794Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:54.864116379Z [resource.labels.instanceId: convergent-ai] [12:34:54.863] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:34:54.864215896Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:55.041893072Z [resource.labels.instanceId: convergent-ai] [12:34:55.041] [34mDEBUG[39m (103): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:55.114733034Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:34:55.159841425Z [resource.labels.instanceId: convergent-ai] [12:34:55.159] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:55.160974465Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:55.160] STT final transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:55.161087528Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:55.160] STT complete (-1ms): "Yes, see."
DEFAULT 2026-07-07T12:34:55.163793134Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Yes, see."
DEFAULT 2026-07-07T12:34:55.164023588Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "gross_annual_income" is 2
DEFAULT 2026-07-07T12:34:55.166534308Z [resource.labels.instanceId: convergent-ai] [12:34:55.161] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:34:55.166610030Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:55.166645264Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:34:55.166672064Z [resource.labels.instanceId: convergent-ai] [12:34:55.162] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:34:55.166709284Z [resource.labels.instanceId: convergent-ai] [12:34:55.162] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:34:55.166743568Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yes, see."
DEFAULT 2026-07-07T12:34:55.166771361Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:34:55.166804951Z [resource.labels.instanceId: convergent-ai] [12:34:55.163] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:34:55.166859502Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, see."
DEFAULT 2026-07-07T12:34:55.166892750Z [resource.labels.instanceId: convergent-ai] [12:34:55.163] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:34:55.166925223Z [resource.labels.instanceId: convergent-ai] [12:34:55.163] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:34:55.564030161Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:34:55.564154513Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=gross_annual_income
DEFAULT 2026-07-07T12:34:55.564232778Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:34:55.564650947Z [resource.labels.instanceId: convergent-ai] [12:34:55.564] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:34:55.564773737Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_1a6a2778-632"
DEFAULT 2026-07-07T12:34:55.567507219Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":119787,"contextItemCount":17,"estimatedContextTokens":347,"userTurnEndAt":1783427695160}
DEFAULT 2026-07-07T12:34:55.568427556Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:34:55.569480691Z [resource.labels.instanceId: convergent-ai] [12:34:55.564] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:34:55.569565707Z [resource.labels.instanceId: convergent-ai] [12:34:55.565] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:34:55.569607685Z [resource.labels.instanceId: convergent-ai] [12:34:55.567] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:34:55.569648824Z [resource.labels.instanceId: convergent-ai] [12:34:55.568] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:34:55.569684405Z [resource.labels.instanceId: convergent-ai] [12:34:55.569] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:34:55.572801706Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:55.572] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:34:55.586622155Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:34:55.783443725Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:55.783] First chunk/token received (TTFT: 211ms)
DEFAULT 2026-07-07T12:34:55.983083361Z [resource.labels.instanceId: convergent-ai] [12:34:55.982] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:34:55.988803656Z [resource.labels.instanceId: convergent-ai] [12:34:55.984] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:34:55.988919398Z [resource.labels.instanceId: convergent-ai] [12:34:55.984] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:34:55.988959629Z [resource.labels.instanceId: convergent-ai] [12:34:55.984] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:34:55.998624482Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:34:55.998] Stream complete (Total: 426ms, chunks: 25)
DEFAULT 2026-07-07T12:34:55.999071236Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:55.998] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:34:55.999166396Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:55.998] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:34:55.999202703Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":120219,"contextItemCount":0,"estimatedContextTokens":3312,"ttftMs":416,"userTurnEndAt":1783427695160}
DEFAULT 2026-07-07T12:34:55.999243252Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:55.999] LLM metrics — TTFT=416ms prompt_tokens=3312 completion_tokens=160
DEFAULT 2026-07-07T12:34:56.001128928Z [resource.labels.instanceId: convergent-ai] [12:34:56.000] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:34:56.002490119Z [resource.labels.instanceId: convergent-ai] [12:34:56.001] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:34:56.002579515Z [resource.labels.instanceId: convergent-ai] [12:34:56.001] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:34:56.289742556Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:34:56.289856143Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":120509,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1129,"agentSpeakingAt":1783427696289,"userTurnEndAt":1783427695160}
DEFAULT 2026-07-07T12:34:56.345843232Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:34:57.680306978Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:57.680] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:34:57.680440856Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:57.680] ── TURN 10 SUMMARY ── stt_done=? llm_start=? llm_first_token=838ms llm_done=838ms tts_start=? tts_done=2520ms
DEFAULT 2026-07-07T12:34:57.680495842Z [resource.labels.instanceId: convergent-ai] [pipeline][12:34:57.680] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:34:57.682133741Z [resource.labels.instanceId: convergent-ai] [12:34:57.681] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:34:57.682909042Z [resource.labels.instanceId: convergent-ai] [12:34:57.682] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:34:58.347716041Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:35:00.846802749Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:35:01.809728565Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:35:01.809390+00:00 convergent-ai CRON[215708]: (root) CMD (command -v debian-sa1 > /dev/null && debian-sa1 1 1)
DEFAULT 2026-07-07T12:35:01.810037731Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:35:01.809855+00:00 convergent-ai CRON[215709]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-07T12:35:01.812584227Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:35:01.812405+00:00 convergent-ai CRON[215707]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-07T12:35:05.350970748Z [resource.labels.instanceId: convergent-ai] [12:35:05.350] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:35:06.422213605Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":10,"sessionAgeMs":130641,"contextItemCount":18,"estimatedContextTokens":387,"userTurnEndAt":1783427695160}
DEFAULT 2026-07-07T12:35:06.423813194Z [resource.labels.instanceId: convergent-ai] [12:35:06.423] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:35:06.423931065Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_1a6a2778-632"
DEFAULT 2026-07-07T12:35:06.423975285Z [resource.labels.instanceId: convergent-ai] message: "Got it. No problem—could you let me know roughly how much your household earns each year before taxes? A range (for example, $60,000–$80,000) works perfectly. "
DEFAULT 2026-07-07T12:35:06.424010724Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:35:06.425344347Z [resource.labels.instanceId: convergent-ai] [12:35:06.424] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:35:14.816835318Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:35:16.383107382Z [resource.labels.instanceId: convergent-ai] [12:35:16.382] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:16.600205439Z [resource.labels.instanceId: convergent-ai] [12:35:16.599] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:16.816795501Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:35:17.259183454Z [resource.labels.instanceId: convergent-ai] [12:35:17.258] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:17.259320189Z [resource.labels.instanceId: convergent-ai] transcript: "Uh"
DEFAULT 2026-07-07T12:35:17.884547001Z [resource.labels.instanceId: convergent-ai] [12:35:17.884] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:17.884671289Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah"
DEFAULT 2026-07-07T12:35:18.540388441Z [resource.labels.instanceId: convergent-ai] [12:35:18.539] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:18.540547466Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I"
DEFAULT 2026-07-07T12:35:18.674291167Z [resource.labels.instanceId: convergent-ai] [12:35:18.673] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:18.674434119Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had"
DEFAULT 2026-07-07T12:35:19.317848702Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:35:19.490617090Z [resource.labels.instanceId: convergent-ai] [12:35:19.489] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:19.490750897Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around"
DEFAULT 2026-07-07T12:35:20.941634057Z [resource.labels.instanceId: convergent-ai] [12:35:20.940] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:20.941761698Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 1"
DEFAULT 2026-07-07T12:35:20.957145498Z [resource.labels.instanceId: convergent-ai] [12:35:20.956] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:20.957278771Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 1200"
DEFAULT 2026-07-07T12:35:20.974014242Z [resource.labels.instanceId: convergent-ai] [12:35:20.973] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:20.974137896Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 120000"
DEFAULT 2026-07-07T12:35:21.099833105Z [resource.labels.instanceId: convergent-ai] [12:35:21.099] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:21.099971792Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 120000 dollars"
DEFAULT 2026-07-07T12:35:21.116346471Z [resource.labels.instanceId: convergent-ai] [12:35:21.115] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:21.116504294Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.133917276Z [resource.labels.instanceId: convergent-ai] [12:35:21.133] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:35:21.134047712Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.134089968Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:35:21.134806433Z [resource.labels.instanceId: convergent-ai] [12:35:21.133] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:35:21.134906127Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.229801648Z [resource.labels.instanceId: convergent-ai] [12:35:21.229] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:21.231433169Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:21.231] STT final transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.231636524Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:21.231] STT complete (-1ms): "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.235771429Z [resource.labels.instanceId: convergent-ai] [12:35:21.232] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:35:21.235892821Z [resource.labels.instanceId: convergent-ai] user_transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.235938857Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:35:21.235971886Z [resource.labels.instanceId: convergent-ai] [12:35:21.233] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:35:21.236010282Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427716316.772
DEFAULT 2026-07-07T12:35:21.236050631Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:35:21.236091463Z [resource.labels.instanceId: convergent-ai] [12:35:21.234] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:21.236127147Z [resource.labels.instanceId: convergent-ai] [12:35:21.234] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:35:21.236166495Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.236202573Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:35:21.441243445Z [resource.labels.instanceId: convergent-ai] [12:35:21.440] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:35:21.441365751Z [resource.labels.instanceId: convergent-ai] transcript: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.441788106Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "Uh yeah, I had around 120000 dollars per year."
DEFAULT 2026-07-07T12:35:21.442087965Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "gross_annual_income" is 3
DEFAULT 2026-07-07T12:35:21.442143747Z [resource.labels.instanceId: convergent-ai] [context-manager] Max attempts reached for "gross_annual_income". Declining field.
DEFAULT 2026-07-07T12:35:21.442885791Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:35:21.442958467Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=monthly_debt
DEFAULT 2026-07-07T12:35:21.443014042Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:35:21.446036607Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":11,"sessionAgeMs":145665,"contextItemCount":19,"estimatedContextTokens":398,"userTurnEndAt":1783427721231}
DEFAULT 2026-07-07T12:35:21.446956385Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:35:21.448156888Z [resource.labels.instanceId: convergent-ai] [12:35:21.441] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:35:21.448240173Z [resource.labels.instanceId: convergent-ai] [12:35:21.441] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:35:21.448277234Z [resource.labels.instanceId: convergent-ai] [12:35:21.443] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:35:21.448315819Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8792f1c1-ac0"
DEFAULT 2026-07-07T12:35:21.448350966Z [resource.labels.instanceId: convergent-ai] [12:35:21.443] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:35:21.448395585Z [resource.labels.instanceId: convergent-ai] [12:35:21.443] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:35:21.448429317Z [resource.labels.instanceId: convergent-ai] [12:35:21.445] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:35:21.448481312Z [resource.labels.instanceId: convergent-ai] [12:35:21.446] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:35:21.448519998Z [resource.labels.instanceId: convergent-ai] [12:35:21.447] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:35:21.451559113Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:21.451] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:35:21.835426552Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:21.835] First chunk/token received (TTFT: 384ms)
DEFAULT 2026-07-07T12:35:25.837345387Z [resource.labels.instanceId: convergent-ai] [12:35:25.836] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:35:25.842971078Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:25.842] Stream complete (Total: 4391ms, chunks: 8)
DEFAULT 2026-07-07T12:35:25.843253955Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:25.843] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:35:25.843354585Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:25.843] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:35:25.843411195Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":11,"sessionAgeMs":150063,"contextItemCount":0,"estimatedContextTokens":3376,"ttftMs":4391,"userTurnEndAt":1783427721231}
DEFAULT 2026-07-07T12:35:25.843479695Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:25.843] LLM metrics — TTFT=4391ms prompt_tokens=3376 completion_tokens=45
DEFAULT 2026-07-07T12:35:25.845734500Z [resource.labels.instanceId: convergent-ai] [12:35:25.838] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:35:25.845832511Z [resource.labels.instanceId: convergent-ai] [12:35:25.838] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:35:25.845869023Z [resource.labels.instanceId: convergent-ai] [12:35:25.838] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:35:25.845904617Z [resource.labels.instanceId: convergent-ai] [12:35:25.844] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:35:25.845941285Z [resource.labels.instanceId: convergent-ai] [12:35:25.845] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:35:25.845988474Z [resource.labels.instanceId: convergent-ai] [12:35:25.845] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:35:26.340847642Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:35:26.341001502Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":11,"sessionAgeMs":150560,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":5109,"agentSpeakingAt":1783427726340,"userTurnEndAt":1783427721231}
DEFAULT 2026-07-07T12:35:27.181380100Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:27.181] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:35:27.181542684Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:27.181] ── TURN 11 SUMMARY ── stt_done=? llm_start=? llm_first_token=4612ms llm_done=4612ms tts_start=? tts_done=5950ms
DEFAULT 2026-07-07T12:35:27.181588208Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:27.181] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:35:27.183372545Z [resource.labels.instanceId: convergent-ai] [12:35:27.182] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:35:27.184660321Z [resource.labels.instanceId: convergent-ai] [12:35:27.183] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:35:30.222894406Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:35:31.260337797Z [resource.labels.instanceId: convergent-ai] [12:35:31.259] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:35:32.222789601Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:35:32.287743248Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":11,"sessionAgeMs":156507,"contextItemCount":20,"estimatedContextTokens":420,"userTurnEndAt":1783427721231}
DEFAULT 2026-07-07T12:35:32.289402156Z [resource.labels.instanceId: convergent-ai] [12:35:32.288] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:35:32.289776910Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_8792f1c1-ac0"
DEFAULT 2026-07-07T12:35:32.289827095Z [resource.labels.instanceId: convergent-ai] message: "Just to confirm — you mentioned $120,000 as your gross annual income. Is that right? "
DEFAULT 2026-07-07T12:35:32.289876816Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:35:32.291271904Z [resource.labels.instanceId: convergent-ai] [12:35:32.290] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:35:34.015858614Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:35:34.726952323Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (avatar-chat).
DEFAULT 2026-07-07T12:35:36.015899516Z [resource.labels.instanceId: convergent-ai] [agent]: Channel started (video).
DEFAULT 2026-07-07T12:35:38.699770782Z [resource.labels.instanceId: convergent-ai] [12:35:38.699] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:38.701189661Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:38.700] STT final transcript: "Yes, it is right."
DEFAULT 2026-07-07T12:35:38.701316870Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:38.701] STT complete (-1ms): "Yes, it is right."
DEFAULT 2026-07-07T12:35:38.705106212Z [resource.labels.instanceId: convergent-ai] [12:35:38.701] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:35:38.705246558Z [resource.labels.instanceId: convergent-ai] user_transcript: "Yes, it is right."
DEFAULT 2026-07-07T12:35:38.705297771Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:35:38.705337115Z [resource.labels.instanceId: convergent-ai] [12:35:38.703] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:35:38.705377476Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427737576.6016
DEFAULT 2026-07-07T12:35:38.705417626Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:35:38.705474355Z [resource.labels.instanceId: convergent-ai] [12:35:38.703] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:38.705522252Z [resource.labels.instanceId: convergent-ai] [12:35:38.703] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:35:38.705560266Z [resource.labels.instanceId: convergent-ai] audioTranscript: "Yes, it is right."
DEFAULT 2026-07-07T12:35:38.705596369Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:35:38.895038175Z [resource.labels.instanceId: convergent-ai] [12:35:38.894] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:35:38.895183784Z [resource.labels.instanceId: convergent-ai] transcript: "Yes, it is right."
DEFAULT 2026-07-07T12:35:39.296241608Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:35:39.296378105Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=monthly_debt
DEFAULT 2026-07-07T12:35:39.296418910Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:35:39.297005498Z [resource.labels.instanceId: convergent-ai] [12:35:39.296] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:35:39.297083283Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_9428e62d-47e"
DEFAULT 2026-07-07T12:35:39.300658215Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":163520,"contextItemCount":21,"estimatedContextTokens":424,"userTurnEndAt":1783427738701}
DEFAULT 2026-07-07T12:35:39.301599567Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:35:39.302885992Z [resource.labels.instanceId: convergent-ai] [12:35:39.296] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:35:39.302979517Z [resource.labels.instanceId: convergent-ai] [12:35:39.297] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:35:39.303020221Z [resource.labels.instanceId: convergent-ai] [12:35:39.300] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:35:39.303050881Z [resource.labels.instanceId: convergent-ai] [12:35:39.301] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:35:39.303092558Z [resource.labels.instanceId: convergent-ai] [12:35:39.302] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:35:39.306520592Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:39.306] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:35:39.488086045Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:39.487] First chunk/token received (TTFT: 181ms)
DEFAULT 2026-07-07T12:35:39.518840180Z [resource.labels.instanceId: convergent-ai] [12:35:39.518] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:35:39.525144714Z [resource.labels.instanceId: convergent-ai] [12:35:39.520] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:35:39.525292326Z [resource.labels.instanceId: convergent-ai] [12:35:39.520] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:35:39.525347537Z [resource.labels.instanceId: convergent-ai] [12:35:39.520] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:35:39.537971297Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:35:39.537] Stream complete (Total: 231ms, chunks: 11)
DEFAULT 2026-07-07T12:35:39.538322067Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:39.538] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:35:39.538396479Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:39.538] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:35:39.538443198Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":163758,"contextItemCount":0,"estimatedContextTokens":3413,"ttftMs":218,"userTurnEndAt":1783427738701}
DEFAULT 2026-07-07T12:35:39.538491058Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:39.538] LLM metrics — TTFT=218ms prompt_tokens=3413 completion_tokens=63
DEFAULT 2026-07-07T12:35:39.540360770Z [resource.labels.instanceId: convergent-ai] [12:35:39.539] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:35:39.541396520Z [resource.labels.instanceId: convergent-ai] [12:35:39.540] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:35:39.541634204Z [resource.labels.instanceId: convergent-ai] [12:35:39.540] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:35:39.608181230Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:35:39.931186262Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:35:39.931334686Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":164151,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1230,"agentSpeakingAt":1783427739931,"userTurnEndAt":1783427738701}
DEFAULT 2026-07-07T12:35:41.279202660Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:41.278] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:35:41.279366217Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:41.279] ── TURN 12 SUMMARY ── stt_done=? llm_start=? llm_first_token=837ms llm_done=837ms tts_start=? tts_done=2577ms
DEFAULT 2026-07-07T12:35:41.279408974Z [resource.labels.instanceId: convergent-ai] [pipeline][12:35:41.279] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:35:41.280998405Z [resource.labels.instanceId: convergent-ai] [12:35:41.280] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:35:41.281793269Z [resource.labels.instanceId: convergent-ai] [12:35:41.280] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:35:49.250132196Z [resource.labels.instanceId: convergent-ai] [12:35:49.249] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:35:50.308470195Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":12,"sessionAgeMs":174528,"contextItemCount":22,"estimatedContextTokens":467,"userTurnEndAt":1783427738701}
DEFAULT 2026-07-07T12:35:50.310039252Z [resource.labels.instanceId: convergent-ai] [12:35:50.309] [32mINFO[39m (103): [36mplayout completed without interruption[39m
DEFAULT 2026-07-07T12:35:50.310226324Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_9428e62d-47e"
DEFAULT 2026-07-07T12:35:50.310417793Z [resource.labels.instanceId: convergent-ai] message: "Great, thanks for confirming. Could you tell me the total amount you pay each month for recurring debts—such as car loans, student loans, credit cards, or other obligations? "
DEFAULT 2026-07-07T12:35:50.310519423Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: speaking → listening
DEFAULT 2026-07-07T12:35:50.312176109Z [resource.labels.instanceId: convergent-ai] [12:35:50.311] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply done[39m
DEFAULT 2026-07-07T12:35:58.283422671Z [resource.labels.instanceId: convergent-ai] [12:35:58.281] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:58.529881891Z [resource.labels.instanceId: convergent-ai] [12:35:58.529] [34mDEBUG[39m (103): [36mCartesia STT START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:35:59.149694200Z [resource.labels.instanceId: convergent-ai] [12:35:59.149] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:59.149842562Z [resource.labels.instanceId: convergent-ai] transcript: "I"
DEFAULT 2026-07-07T12:35:59.480073215Z [resource.labels.instanceId: convergent-ai] [12:35:59.479] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:35:59.480215621Z [resource.labels.instanceId: convergent-ai] transcript: "I pay"
DEFAULT 2026-07-07T12:36:00.101614697Z [resource.labels.instanceId: convergent-ai] [12:36:00.101] [34mDEBUG[39m (103): [36mVAD task: END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:36:00.301627063Z [resource.labels.instanceId: convergent-ai] [12:36:00.301] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:00.301764149Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around"
DEFAULT 2026-07-07T12:36:00.390820501Z [resource.labels.instanceId: convergent-ai] [12:36:00.390] [34mDEBUG[39m (103): [36mVAD task: START_OF_SPEECH[39m
DEFAULT 2026-07-07T12:36:01.510416542Z [resource.labels.instanceId: convergent-ai] [12:36:01.509] [33mWARN[39m (774): [36mCartesia STT WebSocket closed: 1001 Idle timeout[39m
DEFAULT 2026-07-07T12:36:01.516629480Z [resource.labels.instanceId: convergent-ai] [12:36:01.511] [31mERROR[39m (774): [36mCartesia STT stream error[39m
DEFAULT 2026-07-07T12:36:01.516754883Z [resource.labels.instanceId: convergent-ai] [12:36:01.511] [33mWARN[39m (774): [36mfailed to recognize speech, retrying in 0.1ms[39m
DEFAULT 2026-07-07T12:36:01.516785007Z [resource.labels.instanceId: convergent-ai] stt: "cartesia.STT"
DEFAULT 2026-07-07T12:36:01.516806839Z [resource.labels.instanceId: convergent-ai] attempt: 1
DEFAULT 2026-07-07T12:36:01.516832640Z [resource.labels.instanceId: convergent-ai] error: {
DEFAULT 2026-07-07T12:36:01.516854463Z [resource.labels.instanceId: convergent-ai] "type": "APIConnectionError",
DEFAULT 2026-07-07T12:36:01.516872402Z [resource.labels.instanceId: convergent-ai] "message": "Cartesia STT connection closed unexpectedly (code=1001)",
DEFAULT 2026-07-07T12:36:01.516893527Z [resource.labels.instanceId: convergent-ai] "stack":
DEFAULT 2026-07-07T12:36:01.516916655Z [resource.labels.instanceId: convergent-ai] APIConnectionError: Cartesia STT connection closed unexpectedly (code=1001)
DEFAULT 2026-07-07T12:36:01.516936111Z [resource.labels.instanceId: convergent-ai] at WebSocket.<anonymous> (/app/node_modules/@livekit/agents-plugin-cartesia/src/stt.ts:486:11)
DEFAULT 2026-07-07T12:36:01.516955992Z [resource.labels.instanceId: convergent-ai] at WebSocket.emit (node:events:524:28)
DEFAULT 2026-07-07T12:36:01.516973800Z [resource.labels.instanceId: convergent-ai] at WebSocket.emitClose (/app/node_modules/ws/lib/websocket.js:273:10)
DEFAULT 2026-07-07T12:36:01.516991923Z [resource.labels.instanceId: convergent-ai] at TLSSocket.socketOnClose (/app/node_modules/ws/lib/websocket.js:1346:15)
DEFAULT 2026-07-07T12:36:01.517011542Z [resource.labels.instanceId: convergent-ai] at TLSSocket.emit (node:events:536:35)
DEFAULT 2026-07-07T12:36:01.517029674Z [resource.labels.instanceId: convergent-ai] at node:net:343:12
DEFAULT 2026-07-07T12:36:01.517047326Z [resource.labels.instanceId: convergent-ai] at TCP.done (node:_tls_wrap:669:7)
DEFAULT 2026-07-07T12:36:01.517064946Z [resource.labels.instanceId: convergent-ai] at TCP.callbackTrampoline (node:internal/async_hooks:130:17)
DEFAULT 2026-07-07T12:36:01.517081261Z [resource.labels.instanceId: convergent-ai] "body": null,
DEFAULT 2026-07-07T12:36:01.517101083Z [resource.labels.instanceId: convergent-ai] "retryable": true,
DEFAULT 2026-07-07T12:36:01.517117832Z [resource.labels.instanceId: convergent-ai] "name": "APIConnectionError"
DEFAULT 2026-07-07T12:36:01.517147408Z [resource.labels.instanceId: convergent-ai] }
DEFAULT 2026-07-07T12:36:01.517304619Z [resource.labels.instanceId: convergent-ai] [12:36:01.516] [34mDEBUG[39m (774): [36mConnecting to Cartesia STT: wss://api.cartesia.ai/stt/turns/websocket?model=ink-2&sample_rate=16000&encoding=pcm_s16le[39m
DEFAULT 2026-07-07T12:36:01.549706523Z [resource.labels.instanceId: convergent-ai] [12:36:01.549] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:01.549856193Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3"
DEFAULT 2026-07-07T12:36:01.566347900Z [resource.labels.instanceId: convergent-ai] [12:36:01.565] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:01.566504449Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000"
DEFAULT 2026-07-07T12:36:01.817882983Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:36:01.817665+00:00 convergent-ai CRON[215712]: (www-data) CMD (cd /var/www/html/suitecrm && php bin/console suitecrm:cron)
DEFAULT 2026-07-07T12:36:01.819589738Z [resource.labels.instanceId: convergent-ai] 2026-07-07T12:36:01.819435+00:00 convergent-ai CRON[215711]: (CRON) info (No MTA installed, discarding output)
DEFAULT 2026-07-07T12:36:02.209908214Z [resource.labels.instanceId: convergent-ai] [12:36:02.209] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:02.210032429Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000 dollars"
DEFAULT 2026-07-07T12:36:02.370024753Z [resource.labels.instanceId: convergent-ai] [12:36:02.369] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:02.370172803Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000 dollars per"
DEFAULT 2026-07-07T12:36:02.387305663Z [resource.labels.instanceId: convergent-ai] [12:36:02.386] [34mDEBUG[39m (103): [36minterim transcript[39m
DEFAULT 2026-07-07T12:36:02.387441032Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.389764598Z [resource.labels.instanceId: convergent-ai] [12:36:02.388] [34mDEBUG[39m (103): [36mreceived user preflight transcript[39m
DEFAULT 2026-07-07T12:36:02.389894583Z [resource.labels.instanceId: convergent-ai] user_transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.389929056Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:36:02.389960341Z [resource.labels.instanceId: convergent-ai] [12:36:02.389] [34mDEBUG[39m (103): [36mtriggering preemptive generation (PREFLIGHT_TRANSCRIPT)[39m
DEFAULT 2026-07-07T12:36:02.390007482Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.540322831Z [resource.labels.instanceId: convergent-ai] [12:36:02.539] [34mDEBUG[39m (103): [36mCartesia STT END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:36:02.541605127Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:02.541] STT final transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.541727126Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:02.541] STT complete (-1ms): "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.545478172Z [resource.labels.instanceId: convergent-ai] [12:36:02.542] [34mDEBUG[39m (103): [36mreceived user transcript[39m
DEFAULT 2026-07-07T12:36:02.545609386Z [resource.labels.instanceId: convergent-ai] user_transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.545648521Z [resource.labels.instanceId: convergent-ai] language: "en"
DEFAULT 2026-07-07T12:36:02.545682323Z [resource.labels.instanceId: convergent-ai] [12:36:02.543] [33mWARN[39m (103): [36mstt end of speech received while vad is still in a speech segment, flushing vad[39m
DEFAULT 2026-07-07T12:36:02.545722513Z [resource.labels.instanceId: convergent-ai] vadSpeechStartTime: 1783427760325.7217
DEFAULT 2026-07-07T12:36:02.545772496Z [resource.labels.instanceId: convergent-ai] flushed: true
DEFAULT 2026-07-07T12:36:02.545812720Z [resource.labels.instanceId: convergent-ai] [12:36:02.543] [34mDEBUG[39m (103): [36mrunning EOU detection on stt END_OF_SPEECH[39m
DEFAULT 2026-07-07T12:36:02.545844314Z [resource.labels.instanceId: convergent-ai] [12:36:02.543] [34mDEBUG[39m (103): [36mrunning EOU detection[39m
DEFAULT 2026-07-07T12:36:02.545905727Z [resource.labels.instanceId: convergent-ai] audioTranscript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.545938844Z [resource.labels.instanceId: convergent-ai] turnDetectionMode: "stt"
DEFAULT 2026-07-07T12:36:02.571647111Z [resource.labels.instanceId: convergent-ai] [12:36:02.571] [34mDEBUG[39m (103): [36mend of user turn[39m
DEFAULT 2026-07-07T12:36:02.571769275Z [resource.labels.instanceId: convergent-ai] transcript: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.572290969Z [resource.labels.instanceId: convergent-ai] [agent-hook]: onUserTurnCompleted hook triggered with message: "I pay around 3000 dollars per month."
DEFAULT 2026-07-07T12:36:02.572599918Z [resource.labels.instanceId: convergent-ai] [context-manager] Attempt count for "monthly_debt" is 2
DEFAULT 2026-07-07T12:36:02.575377614Z [resource.labels.instanceId: convergent-ai] [12:36:02.571] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted started[39m
DEFAULT 2026-07-07T12:36:02.575514679Z [resource.labels.instanceId: convergent-ai] [12:36:02.572] [34mDEBUG[39m (103): [36mEOU detection task completed[39m
DEFAULT 2026-07-07T12:36:02.972595164Z [resource.labels.instanceId: convergent-ai] [agent-debug]: System instruction message prepended to session.chatCtx.
DEFAULT 2026-07-07T12:36:02.972708285Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Instructions updated — stage=2, pendingField=monthly_debt
DEFAULT 2026-07-07T12:36:02.972750405Z [resource.labels.instanceId: convergent-ai] [agent-hook]: Local mutable chatCtx system instructions updated.
DEFAULT 2026-07-07T12:36:02.973209361Z [resource.labels.instanceId: convergent-ai] [12:36:02.972] [32mINFO[39m (103): [36mCreating speech handle[39m
DEFAULT 2026-07-07T12:36:02.973296872Z [resource.labels.instanceId: convergent-ai] speech_id: "speech_69609e3b-858"
DEFAULT 2026-07-07T12:36:02.976395430Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":13,"sessionAgeMs":187196,"contextItemCount":23,"estimatedContextTokens":476,"userTurnEndAt":1783427762541}
DEFAULT 2026-07-07T12:36:02.977328114Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: listening → thinking
DEFAULT 2026-07-07T12:36:02.978410Z [resource.labels.instanceId: convergent-ai] [12:36:02.973] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply started[39m
DEFAULT 2026-07-07T12:36:02.978540713Z [resource.labels.instanceId: convergent-ai] [12:36:02.973] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference started[39m
DEFAULT 2026-07-07T12:36:02.978582690Z [resource.labels.instanceId: convergent-ai] [12:36:02.975] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.userTurnCompleted done[39m
DEFAULT 2026-07-07T12:36:02.978618450Z [resource.labels.instanceId: convergent-ai] [12:36:02.976] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments started[39m
DEFAULT 2026-07-07T12:36:02.978671925Z [resource.labels.instanceId: convergent-ai] [12:36:02.977] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions started[39m
DEFAULT 2026-07-07T12:36:02.982143134Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:36:02.981] Sending request to Cerebras: model=gpt-oss-120b
DEFAULT 2026-07-07T12:36:03.172999830Z [resource.labels.instanceId: convergent-ai] [llm-extractor] Extracted multi-field raw JSON: null
DEFAULT 2026-07-07T12:36:03.200900624Z [resource.labels.instanceId: convergent-ai] [context-manager] Stage2: extracted monthly_debt=3000, awaiting confirm
DEFAULT 2026-07-07T12:36:03.297447334Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:36:03.297] First chunk/token received (TTFT: 316ms)
DEFAULT 2026-07-07T12:36:03.317105886Z [resource.labels.instanceId: convergent-ai] [12:36:03.316] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference started[39m
DEFAULT 2026-07-07T12:36:03.323902757Z [resource.labels.instanceId: convergent-ai] [cerebras-proxy][12:36:03.323] Stream complete (Total: 342ms, chunks: 7)
DEFAULT 2026-07-07T12:36:03.324319214Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:03.324] LLM first token received TTFT=-1ms ✓
DEFAULT 2026-07-07T12:36:03.324420938Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:03.324] LLM stream complete total=-1ms
DEFAULT 2026-07-07T12:36:03.324489601Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":13,"sessionAgeMs":187544,"contextItemCount":0,"estimatedContextTokens":3470,"ttftMs":341,"userTurnEndAt":1783427762541}
DEFAULT 2026-07-07T12:36:03.324530833Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:03.324] LLM metrics — TTFT=341ms prompt_tokens=3470 completion_tokens=44
DEFAULT 2026-07-07T12:36:03.326863674Z [resource.labels.instanceId: convergent-ai] [12:36:03.318] [34mDEBUG[39m (103): [36mUsing TTS aligned transcripts for transcription node input[39m
DEFAULT 2026-07-07T12:36:03.326978329Z [resource.labels.instanceId: convergent-ai] [12:36:03.318] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding started[39m
DEFAULT 2026-07-07T12:36:03.327011798Z [resource.labels.instanceId: convergent-ai] [12:36:03.318] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding started[39m
DEFAULT 2026-07-07T12:36:03.327051939Z [resource.labels.instanceId: convergent-ai] [12:36:03.325] [34mDEBUG[39m (103): [36mTask.runTask: task performToolExecutions done[39m
DEFAULT 2026-07-07T12:36:03.327078056Z [resource.labels.instanceId: convergent-ai] [12:36:03.326] [34mDEBUG[39m (103): [36mTask.runTask: task AgentActivity.pipelineReply.produceSegments done[39m
DEFAULT 2026-07-07T12:36:03.327114399Z [resource.labels.instanceId: convergent-ai] [12:36:03.326] [34mDEBUG[39m (103): [36mTask.runTask: task performLLMInference done[39m
DEFAULT 2026-07-07T12:36:03.653302493Z [resource.labels.instanceId: convergent-ai] [agent-debug]: Agent state: thinking → speaking
DEFAULT 2026-07-07T12:36:03.653444649Z [resource.labels.instanceId: convergent-ai] {"type":"ailana-metrics","event":"turn","turnNumber":13,"sessionAgeMs":187873,"contextItemCount":0,"estimatedContextTokens":0,"e2eLatencyMs":1112,"agentSpeakingAt":1783427763653,"userTurnEndAt":1783427762541}
DEFAULT 2026-07-07T12:36:04.493514679Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:04.493] TTS audio complete render_dur=-1ms
DEFAULT 2026-07-07T12:36:04.493648272Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:04.493] ── TURN 13 SUMMARY ── stt_done=? llm_start=? llm_first_token=783ms llm_done=783ms tts_start=? tts_done=1952ms
DEFAULT 2026-07-07T12:36:04.493685382Z [resource.labels.instanceId: convergent-ai] [pipeline][12:36:04.493] TTS metrics — audio_dur=-1ms
DEFAULT 2026-07-07T12:36:04.495576768Z [resource.labels.instanceId: convergent-ai] [12:36:04.495] [34mDEBUG[39m (103): [36mTask.runTask: task performTextForwarding done[39m
DEFAULT 2026-07-07T12:36:04.496299777Z [resource.labels.instanceId: convergent-ai] [12:36:04.495] [34mDEBUG[39m (103): [36mTask.runTask: task performTTSInference done[39m
DEFAULT 2026-07-07T12:36:08.331422382Z [resource.labels.instanceId: convergent-ai] [12:36:08.330] [34mDEBUG[39m (103): [36mTask.runTask: task performAudioForwarding done[39m
DEFAULT 2026-07-07T12:36:09.253992270Z [resource.labels.instanceId: convergent-ai] [12:36:09.253] [34mDEBUG[39m (774): [36mconnection state changed[39m
DEFAULT 2026-07-07T12:36:09.254117183Z [resource.labels.instanceId: convergent-ai] state: 0
DEFAULT 2026-07-07T12:36:09.255984009Z [resource.labels.instanceId: convergent-ai] [12:36:09.255] [34mDEBUG[39m (18): [36mjob exiting[39m
DEFAULT 2026-07-07T12:36:09.261472615Z [resource.labels.instanceId: convergent-ai] [12:36:09.254] [34mDEBUG[39m (774): [36mshutting down[39m
DEFAULT 2026-07-07T12:36:09.261585911Z [resource.labels.instanceId: convergent-ai] jobID: "AJ_KKbykDtAzKdA"
DEFAULT 2026-07-07T12:36:09.261619443Z [resource.labels.instanceId: convergent-ai] [12:36:09.255] [34mDEBUG[39m (774): [36maec warmup expired, re-enabling interruptions[39m
DEFAULT 2026-07-07T12:36:09.261655909Z [resource.labels.instanceId: convergent-ai] [12:36:09.256] [34mDEBUG[39m (774): [36mTask.runTask: task AgentActivity_onExit started[39m
DEFAULT 2026-07-07T12:36:09.261686913Z [resource.labels.instanceId: convergent-ai] [12:36:09.257] [34mDEBUG[39m (774): [36mTask.runTask: task AgentActivity_onExit done[39m
DEFAULT 2026-07-07T12:36:09.261719136Z [resource.labels.instanceId: convergent-ai] [12:36:09.257] [32mINFO[39m (774): [36mmainTask: scheduling paused and no more speech tasks to wait[39m
DEFAULT 2026-07-07T12:36:09.261752538Z [resource.labels.instanceId: convergent-ai] [12:36:09.257] [32mINFO[39m (774): [36mAgentActivity mainTask: exiting[39m
DEFAULT 2026-07-07T12:36:09.265077907Z [resource.labels.instanceId: convergent-ai] [12:36:09.264] [34mDEBUG[39m (774): [36mFFmpeg encoding finished[39m
DEFAULT 2026-07-07T12:36:09.276180233Z [resource.labels.instanceId: convergent-ai] [12:36:09.265] [34mDEBUG[39m (774): [36mTask.runTask: task recorder_io_encode_task done[39m
DEFAULT 2026-07-07T12:36:09.276305824Z [resource.labels.instanceId: convergent-ai] [12:36:09.267] [34mDEBUG[39m (774): [36mUser turn commit task cancelled[39m
DEFAULT 2026-07-07T12:36:09.276345227Z [resource.labels.instanceId: convergent-ai] [12:36:09.269] [34mDEBUG[39m (774): [36mVAD task closed[39m
DEFAULT 2026-07-07T12:36:09.276381386Z [resource.labels.instanceId: convergent-ai] [12:36:09.271] [32mINFO[39m (774): [36mAgentSession closed[39m
