package com.GameVerse.GameVerse.controller;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLEncoder;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import com.GameVerse.GameVerse.model.User;
import com.GameVerse.GameVerse.repository.UserRepository;
import com.GameVerse.GameVerse.security.JwtService;

@RestController
@RequestMapping("/auth/steam")
@CrossOrigin(origins = "http://localhost:3000")
public class SteamController {
    @Value("${steam.realm}")
    private String realm;

    @Value("${steam.redirect-uri}")
    private String redirectUri;

    @Value("${steam.api.key}")
    private String apiKey;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService; 

    @GetMapping
    public RedirectView redirectToSteam(@RequestParam String token) {
        String steamLoginUrl = "https://steamcommunity.com/openid/login"
            + "?openid.ns=http://specs.openid.net/auth/2.0"
            + "&openid.mode=checkid_setup"
            + "&openid.return_to=" + redirectUri + "?token=" + token
            + "&openid.realm=" + realm
            + "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select"
            + "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select";

        return new RedirectView(steamLoginUrl);
    }

    @GetMapping("/callback")
    public RedirectView handleCallback(@RequestParam Map<String, String> params) {
        // Verify it's actually from Steam
        if (!verifySteamResponse(params)) {
            return new RedirectView(frontendUrl + "/login?error=true");
        }

        String claimedId = params.get("openid.claimed_id");
        String steamId = claimedId.substring(claimedId.lastIndexOf("/") + 1);

        String token = params.get("token");
        String userId = jwtService.extractUserId(token);

        // Find by ID since that's what your JWT stores
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setSteamId(steamId);
            userRepository.save(user);
        }

        return new RedirectView(frontendUrl + "/profile/" + user.getUsername());
    }


    private boolean verifySteamResponse(Map<String, String> params) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("openid.ns=http://specs.openid.net/auth/2.0");
            sb.append("&openid.mode=check_authentication");

            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!entry.getKey().equals("openid.mode")) {
                    sb.append("&").append(entry.getKey())
                    .append("=").append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                }
            }

            URI uri = URI.create("https://steamcommunity.com/openid/login");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.getOutputStream().write(sb.toString().getBytes());

            String response = new String(conn.getInputStream().readAllBytes());
            return response.contains("is_valid:true");

        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/getOwnedGames/{steamId}")
    public ResponseEntity<?> getOwnedGames(@PathVariable String steamId) {
        String url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=" + apiKey +"&steamid="+ steamId + "&include_appinfo=true&include_played_free_games=1";
        RestTemplate rest = new RestTemplate();
        return ResponseEntity.ok(rest.getForObject(url, Object.class));
    }

    @GetMapping("/search-games")
    public ResponseEntity<?> searchGames(
        @RequestParam String query,
        @RequestParam(defaultValue = "12") int limit) {
    try {
        String encodedQuery = URLEncoder.encode(query, "UTF-8");
        String url = "https://store.steampowered.com/api/storesearch/?term="
                + encodedQuery + "&l=english&cc=US";

        RestTemplate rest = new RestTemplate();
        return ResponseEntity.ok(rest.getForObject(url, Object.class));
    } catch (Exception e) {
        return ResponseEntity.status(502).body(Map.of(
                "error", "Steam search failed",
                "message", e.getMessage()
        ));
    }
}
    
}
