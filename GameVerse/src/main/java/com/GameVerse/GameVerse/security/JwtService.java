package com.GameVerse.GameVerse.security;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.GameVerse.GameVerse.model.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    @Value("${security.jwt.expiration-time2:2592000000}")
    private long jwtExpiration2;

    public String generateToken(String userId, Role role) {
        return generateToken(userId, role, false);
    }   

        // Generate token with userId AND role
    public String generateToken(String userId, Role role, boolean rememberMe) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        long expiry = rememberMe ? jwtExpiration2 : jwtExpiration;
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role.name())  // ADD ROLE TO TOKEN
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // Extract userId from token
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    //Extract role from token
    public Role extractRole(String token) {
        Claims claims = extractAllClaims(token);
        String roleString = claims.get("role", String.class);
        return Role.valueOf(roleString);
    }
    
    // Validate token
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());
        
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
