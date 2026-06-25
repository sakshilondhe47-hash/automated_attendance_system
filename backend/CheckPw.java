import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class CheckPw {
  public static void main(String[] args) {
    String hash = "$2a$10$K1Ar.UIQi3plEJpmkQZ4SeFXAP5gB04qpwQhvH9mR0FqAX1bty5fm";
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    System.out.println(encoder.matches("admin123", hash));
  }
}
